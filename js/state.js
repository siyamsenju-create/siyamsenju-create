/**********************************************************
 * STATE MANAGEMENT (ClassroomAgent & UserAgent)
 **********************************************************/

/**
 * UserAgent
 * Represents the local user (Student or Teacher)
 */
const UserAgent = {
  id: 'user_' + Math.random().toString(36).substr(2, 9),
  role: 'student', // 'student' or 'teacher'
  name: '', // Optional
  sessionId: null,
  upvotedQuestions: new Set(),
  lastQuestionTime: 0,
  
  joinSession(sessionId, role = 'student') {
    this.sessionId = sessionId;
    this.role = role;
  },
  
  leaveSession() {
    this.sessionId = null;
    this.upvotedQuestions.clear();
  },

  hasUpvoted(qId) {
    return this.upvotedQuestions.has(qId);
  },

  toggleUpvote(qId) {
    if (this.upvotedQuestions.has(qId)) {
      this.upvotedQuestions.delete(qId);
      return false;
    } else {
      this.upvotedQuestions.add(qId);
      return true;
    }
  },

  canAskQuestion() {
    const now = Date.now();
    // 5 second rate limit
    if (now - this.lastQuestionTime < 5000) {
      return false;
    }
    this.lastQuestionTime = now;
    return true;
  }
};

/**
 * ClassroomAgent
 * Represents the global state of the live classroom
 */
const ClassroomAgent = {
  sessions: {}, // In a real app, this would be on the server/DB

  createSession(className, teacherId, teacherName) {
    // Generate a simple 6-char code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Fallback/demo codes if preferred later
    // code = 'SD2024';

    const session = {
      id: code,
      className: className || 'Live Session',
      teacherId: teacherId,
      teacherName: teacherName,
      status: 'active', // 'active' or 'closed'
      participants: 1, // Start with teacher
      questions: [],
      createdAt: Date.now()
    };
    
    this.sessions[code] = session;
    return session;
  },

  getSession(id) {
    return this.sessions[id];
  },

  joinSession(id) {
      const session = this.sessions[id];
      if (session && session.status === 'active') {
          session.participants++;
          return session;
      }
      return null;
  },
  
  leaveSession(id) {
      const session = this.sessions[id];
      if (session) {
          session.participants = Math.max(0, session.participants - 1);
      }
  },

  addQuestion(sessionId, text, authorId) {
    const session = this.sessions[sessionId];
    if (!session) return null;

    const q = {
      id: 'q_' + Math.random().toString(36).substr(2, 9),
      text: text,
      authorId: authorId,
      votes: 0,
      isAnswered: false,
      isPinned: false,
      timestamp: Date.now()
    };

    session.questions.push(q);
    return q;
  },

  upvoteQuestion(sessionId, qId, value) {
    const session = this.sessions[sessionId];
    if (!session) return null;
    
    const q = session.questions.find(x => x.id === qId);
    if (q) {
        q.votes += value;
    }
    return q;
  },

  markAnswered(sessionId, qId) {
      const session = this.sessions[sessionId];
      if (!session) return null;
      const q = session.questions.find(x => x.id === qId);
      if (q) q.isAnswered = true;
      return q;
  },

  pinQuestion(sessionId, qId) {
      const session = this.sessions[sessionId];
      if (!session) return null;
      // unpin others
      session.questions.forEach(x => x.isPinned = false);
      const q = session.questions.find(x => x.id === qId);
      if (q) q.isPinned = true;
      return q;
  },

  unpinAll(sessionId) {
      const session = this.sessions[sessionId];
      if (!session) return;
      session.questions.forEach(x => x.isPinned = false);
  },

  deleteQuestion(sessionId, qId) {
      const session = this.sessions[sessionId];
      if (!session) return;
      session.questions = session.questions.filter(x => x.id !== qId);
  },

  endSession(sessionId) {
      const session = this.sessions[sessionId];
      if (session) {
          session.status = 'closed';
      }
  }
};
