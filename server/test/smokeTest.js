const http = require('http');
const mongoose = require('mongoose');

async function runSmokeTests() {
  console.log('[SmokeTest] Initializing server and database...');

  // Start express server
  const { app, server } = require('../index');

  const request = (method, path, body = null, headers = {}) => {
    return new Promise((resolve, reject) => {
      const port = server.address().port;
      const options = {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch (e) {
            parsed = data;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      });

      req.on('error', reject);
      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  };

  // Wait until Mongoose is connected and seeded
  console.log('[SmokeTest] Waiting for database connection and seed readiness...');
  while (mongoose.connection.readyState !== 1) {
    await new Promise((r) => setTimeout(r, 500));
  }

  const User = require('../models/User');
  let userCount = await User.countDocuments();
  while (userCount === 0) {
    await new Promise((r) => setTimeout(r, 500));
    userCount = await User.countDocuments();
  }
  console.log(`[SmokeTest] Database connected and verified with ${userCount} users seeded.`);

  let passed = 0;
  let total = 0;

  function assert(desc, condition) {
    total++;
    if (condition) {
      console.log(`  PASS: ${desc}`);
      passed++;
    } else {
      console.error(`  FAIL: ${desc}`);
    }
  }

  try {
    // 1. Health check
    console.log('\n--- 1. Testing Health Check ---');
    const health = await request('GET', '/api/health');
    assert('Health returns 200 OK', health.status === 200 && health.body.status === 'ok');

    // 2. Student Login
    console.log('\n--- 2. Testing Student Auth ---');
    const studentLogin = await request('POST', '/api/auth/login', {
      email: 'student1@quizcraft.com',
      password: 'Student@123',
    });
    assert('Student1 logs in successfully (200)', studentLogin.status === 200 && !!studentLogin.body.token);
    const studentToken = studentLogin.body.token;

    // 3. Current User Profile
    const me = await request('GET', '/api/auth/me', null, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert('Get /api/auth/me returns student role', me.body.user && me.body.user.role === 'student');

    // 4. Topics aggregation
    console.log('\n--- 3. Testing Topics API ---');
    const topicsRes = await request('GET', '/api/topics');
    assert('Topics list contains at least 5 topics', topicsRes.body.topics.length >= 5);
    const hasDbms = topicsRes.body.topics.some((t) => t.topic === 'dbms');
    assert('Topics list includes DBMS with breakdown', hasDbms);

    // 5. Questions list
    console.log('\n--- 4. Testing Questions API ---');
    const questionsRes = await request('GET', '/api/questions?topic=dbms');
    assert('Approved DBMS questions returned', questionsRes.body.questions.length > 0);

    // 6. Weak Topics Analytics (Differentiating Feature)
    console.log('\n--- 5. Testing Weak Topics Analytics ---');
    const weakRes = await request('GET', '/api/analytics/weak-topics', null, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert('Weak topics API returns 200', weakRes.status === 200);
    const weakList = weakRes.body.topics.filter((t) => t.isWeak);
    assert('DBMS and/or Networks correctly flagged as weak topics', weakList.length >= 2);
    assert('Top missed questions identified', Array.isArray(weakRes.body.mostMissedQuestions));

    // 7. Summary Analytics
    const summaryRes = await request('GET', '/api/analytics/summary', null, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert('Summary has attempts and score history', summaryRes.body.totalAttempts >= 4);

    // 8. Auto-generate Quiz
    console.log('\n--- 6. Testing Quiz Creation & Taking ---');
    const quizCreate = await request(
      'POST',
      '/api/quizzes',
      {
        title: 'Auto Practice Quiz',
        description: 'Generated test quiz',
        autoGenerate: true,
        topics: ['dbms'],
        difficulty: 'all',
        count: 3,
      },
      {
        Authorization: `Bearer ${studentToken}`,
      }
    );
    assert('Auto-generated quiz created (201)', quizCreate.status === 201 && quizCreate.body.quiz.questions.length === 3);
    const newQuizId = quizCreate.body.quiz._id;

    // 9. Take Quiz (Sanitized: NO correctIndex or explanation)
    const quizForTaking = await request('GET', `/api/quizzes/${newQuizId}`);
    const q1 = quizForTaking.body.quiz.questions[0];
    assert('Taking quiz does NOT leak correctIndex', q1.correctIndex === undefined);
    assert('Taking quiz does NOT leak explanation', q1.explanation === undefined);

    // 10. Submit Attempt
    const attemptSub = await request(
      'POST',
      `/api/quizzes/${newQuizId}/attempts`,
      {
        answers: [
          { questionId: q1._id, selectedIndex: 0 },
        ],
        durationSeconds: 45,
      },
      {
        Authorization: `Bearer ${studentToken}`,
      }
    );
    assert('Attempt graded and recorded (201)', attemptSub.status === 201 && attemptSub.body.results.length === 3);

    // 11. Moderator Workflow
    console.log('\n--- 7. Testing Moderator Workflow ---');
    const modLogin = await request('POST', '/api/auth/login', {
      email: 'moderator@quizcraft.com',
      password: 'Moderator@123',
    });
    assert('Moderator logs in successfully', modLogin.status === 200 && modLogin.body.user.role === 'moderator');
    const modToken = modLogin.body.token;

    const pending = await request('GET', '/api/questions/pending', null, {
      Authorization: `Bearer ${modToken}`,
    });
    assert('Pending queue has questions', pending.body.questions.length > 0);

    if (pending.body.questions.length > 0) {
      const qToMod = pending.body.questions[0]._id;
      const modAction = await request(
        'PATCH',
        `/api/questions/${qToMod}/moderate`,
        { status: 'approved', note: 'Looks good for the quiz bank' },
        { Authorization: `Bearer ${modToken}` }
      );
      assert('Moderator approved pending question', modAction.body.question.status === 'approved');
    }

    console.log(`\n========================================`);
    console.log(`SMOKE TESTS RESULT: ${passed}/${total} PASSED`);
    console.log(`========================================\n`);

    server.close();
    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('[SmokeTest Error]', err);
    server.close();
    process.exit(1);
  }
}

runSmokeTests();
