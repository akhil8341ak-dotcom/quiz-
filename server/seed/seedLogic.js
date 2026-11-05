const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Question = require('../models/Question');
const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');

const seedDatabase = async () => {
  console.log('[SeedLogic] Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    Question.deleteMany({}),
    Quiz.deleteMany({}),
    Attempt.deleteMany({}),
  ]);

  // 1. Users
  console.log('[SeedLogic] Creating users...');
  const salt = await bcrypt.genSalt(10);
  const modHash = await bcrypt.hash('Moderator@123', salt);
  const student1Hash = await bcrypt.hash('Student@123', salt);
  const student2Hash = await bcrypt.hash('Student@123', salt);

  const moderator = await User.create({
    name: 'Prof. Alex Moderator',
    email: 'moderator@quizcraft.com',
    passwordHash: modHash,
    role: 'moderator',
  });

  const student1 = await User.create({
    name: 'Sam Student',
    email: 'student1@quizcraft.com',
    passwordHash: student1Hash,
    role: 'student',
  });

  const student2 = await User.create({
    name: 'Jordan Learner',
    email: 'student2@quizcraft.com',
    passwordHash: student2Hash,
    role: 'student',
  });

  // 2. Approved Questions
  const rawQuestions = [
    // TOPIC: Data Structures
    {
      topic: 'data structures',
      topicDisplay: 'Data Structures',
      difficulty: 'easy',
      text: 'Which data structure operates on a Last-In-First-Out (LIFO) principle?',
      options: ['Queue', 'Stack', 'Array', 'Linked List'],
      correctIndex: 1,
      explanation: 'A Stack strictly follows LIFO order where elements are pushed and popped from the same end (top).',
    },
    {
      topic: 'data structures',
      topicDisplay: 'Data Structures',
      difficulty: 'easy',
      text: 'What is the average time complexity of accessing an element in an array by its index?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
      correctIndex: 0,
      explanation: 'Arrays store elements in contiguous memory locations, allowing direct calculation of memory address in O(1) time.',
    },
    {
      topic: 'data structures',
      topicDisplay: 'Data Structures',
      difficulty: 'medium',
      text: 'In a balanced Binary Search Tree (AVL tree), what is the maximum height with n nodes?',
      options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
      correctIndex: 1,
      explanation: 'AVL trees strictly maintain a balance factor between -1 and +1, guaranteeing a maximum height of ~1.44 log2(n), which is O(log n).',
    },
    {
      topic: 'data structures',
      topicDisplay: 'Data Structures',
      difficulty: 'medium',
      text: 'Which collision resolution technique stores all colliding elements in a linked list at the hashed index?',
      options: ['Linear Probing', 'Quadratic Probing', 'Separate Chaining', 'Double Hashing'],
      correctIndex: 2,
      explanation: 'Separate Chaining maintains an auxiliary data structure (like a linked list) at each bucket to hold all collided keys.',
    },
    {
      topic: 'data structures',
      topicDisplay: 'Data Structures',
      difficulty: 'hard',
      text: 'What is the amortized time complexity of inserting an element into a Fibonacci Heap?',
      options: ['O(log n)', 'O(1)', 'O(n)', 'O(log* n)'],
      correctIndex: 1,
      explanation: 'Fibonacci Heaps delay consolidation of trees until extract-min, yielding O(1) amortized insertion, union, and decrease-key operations.',
    },
    {
      topic: 'data structures',
      topicDisplay: 'Data Structures',
      difficulty: 'hard',
      text: 'Which data structure is most optimal for finding the Lowest Common Ancestor (LCA) in a tree with O(1) query time after preprocessing?',
      options: ['Segment Tree with Euler Tour', 'Fenwick Tree', 'Splay Tree', 'Red-Black Tree'],
      correctIndex: 0,
      explanation: 'By converting the LCA problem to a Range Minimum Query (RMQ) using an Euler Tour and a Sparse Table / Segment Tree, queries run in O(1) time.',
    },

    // TOPIC: DBMS
    {
      topic: 'dbms',
      topicDisplay: 'DBMS',
      difficulty: 'easy',
      text: 'What does the "A" stand for in the ACID properties of a database transaction?',
      options: ['Authenticity', 'Atomicity', 'Availability', 'Accuracy'],
      correctIndex: 1,
      explanation: 'Atomicity ensures that all operations in a transaction either completely succeed or completely fail (all-or-nothing).',
    },
    {
      topic: 'dbms',
      topicDisplay: 'DBMS',
      difficulty: 'easy',
      text: 'Which SQL constraint uniquely identifies each record in a database table and disallows NULL values?',
      options: ['FOREIGN KEY', 'UNIQUE', 'PRIMARY KEY', 'CHECK'],
      correctIndex: 2,
      explanation: 'A PRIMARY KEY uniquely identifies every record in a table and cannot contain NULL values.',
    },
    {
      topic: 'dbms',
      topicDisplay: 'DBMS',
      difficulty: 'medium',
      text: 'A relation is in Boyce-Codd Normal Form (BCNF) if and only if for every functional dependency X -> Y:',
      options: ['Y is a prime attribute', 'X is a superkey', 'X is a subset of Y', 'Y is not transitive'],
      correctIndex: 1,
      explanation: 'BCNF is a stricter version of 3NF where every non-trivial functional dependency X -> Y requires X to be a superkey.',
    },
    {
      topic: 'dbms',
      topicDisplay: 'DBMS',
      difficulty: 'medium',
      text: 'In database concurrency control, what anomaly does the Two-Phase Locking (2PL) protocol guarantee to prevent?',
      options: ['Deadlocks', 'Non-serializable schedules', 'Dirty reads only', 'High disk I/O'],
      correctIndex: 1,
      explanation: 'Strict 2PL guarantees serializability of concurrent transactions, although it does not prevent deadlocks.',
    },
    {
      topic: 'dbms',
      topicDisplay: 'DBMS',
      difficulty: 'hard',
      text: 'Which isolation level allows Phantom Reads but prevents Dirty Reads and Non-repeatable Reads?',
      options: ['Read Uncommitted', 'Read Committed', 'Repeatable Read', 'Serializable'],
      correctIndex: 2,
      explanation: 'Repeatable Read locks rows read by the transaction, preventing dirty and non-repeatable reads, but may allow new inserted rows (phantoms) to appear in subsequent range queries.',
    },
    {
      topic: 'dbms',
      topicDisplay: 'DBMS',
      difficulty: 'hard',
      text: 'What is the primary difference between a B-Tree and a B+ Tree index?',
      options: [
        'B-Trees store records only in leaf nodes',
        'B+ Trees store actual data pointers exclusively in leaf nodes and link leaves sequentially',
        'B+ Trees have fewer children per node than B-Trees',
        'B-Trees cannot be used for range queries',
      ],
      correctIndex: 1,
      explanation: 'In a B+ Tree, non-leaf nodes only hold search keys for routing, all actual data pointers reside in leaf nodes, and leaf nodes form a doubly linked list for optimal range scans.',
    },

    // TOPIC: Operating Systems
    {
      topic: 'operating systems',
      topicDisplay: 'Operating Systems',
      difficulty: 'easy',
      text: 'Which operating system component is responsible for loading the kernel into memory during boot?',
      options: ['Shell', 'Bootloader', 'Device Driver', 'Assembler'],
      correctIndex: 1,
      explanation: 'The bootloader (such as GRUB or Windows Boot Manager) initializes hardware and loads the kernel into physical RAM.',
    },
    {
      topic: 'operating systems',
      topicDisplay: 'Operating Systems',
      difficulty: 'easy',
      text: 'What state does a process enter when it is waiting for an I/O operation to complete?',
      options: ['Running', 'Terminated', 'Blocked / Waiting', 'Zombie'],
      correctIndex: 2,
      explanation: 'When a process requests an I/O operation, the OS transitions it from Running to the Blocked/Waiting state until the interrupt fires.',
    },
    {
      topic: 'operating systems',
      topicDisplay: 'Operating Systems',
      difficulty: 'medium',
      text: 'Which of the following is NOT one of the four necessary Coffman conditions for a deadlock?',
      options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption', 'Circular Wait'],
      correctIndex: 2,
      explanation: 'The Coffman condition is "No Preemption" (resources cannot be forcibly taken). Preemption actually prevents deadlock.',
    },
    {
      topic: 'operating systems',
      topicDisplay: 'Operating Systems',
      difficulty: 'medium',
      text: 'In virtual memory systems, what does Belady\'s Anomaly demonstrate?',
      options: [
        'Increasing page frames can increase the number of page faults under FIFO replacement',
        'LRU replacement is always inferior to Optimal',
        'TLB misses double the memory lookup latency',
        'Thrashing can be solved by increasing process priority',
      ],
      correctIndex: 0,
      explanation: 'Belady\'s Anomaly states that for certain page reference strings, allocating more page frames results in more page faults when using the FIFO page replacement algorithm.',
    },
    {
      topic: 'operating systems',
      topicDisplay: 'Operating Systems',
      difficulty: 'hard',
      text: 'Which CPU scheduling algorithm provides the theoretical minimal average waiting time for a set of stationary processes?',
      options: ['Round Robin (RR)', 'Shortest Job First (SJF)', 'First Come First Served (FCFS)', 'Priority Scheduling'],
      correctIndex: 1,
      explanation: 'Shortest Job First (SJF) is mathematically optimal because moving a shorter job ahead decreases waiting time for that job more than it increases waiting time for the longer job.',
    },
    {
      topic: 'operating systems',
      topicDisplay: 'Operating Systems',
      difficulty: 'hard',
      text: 'What mechanism does Linux use to implement Copy-on-Write (COW) during the fork() system call?',
      options: [
        'Duplicate page tables marking memory pages as read-only; trap write faults to duplicate memory',
        'Immediate physical copying of all RAM pages',
        'Compressing child process RAM until first modification',
        'Swapping parent memory directly to disk swap space',
      ],
      correctIndex: 0,
      explanation: 'fork() duplicates only page table references and marks pages read-only. When either process attempts a write, a page-fault trap allocates and copies the specific page.',
    },

    // TOPIC: Networks
    {
      topic: 'networks',
      topicDisplay: 'Networks',
      difficulty: 'easy',
      text: 'Which protocol is responsible for mapping an IP address to a physical MAC address on a local network?',
      options: ['DNS', 'DHCP', 'ARP', 'ICMP'],
      correctIndex: 2,
      explanation: 'Address Resolution Protocol (ARP) translates a Layer 3 IPv4 address into a Layer 2 MAC address.',
    },
    {
      topic: 'networks',
      topicDisplay: 'Networks',
      difficulty: 'easy',
      text: 'What is the default port number used by HTTPS communication?',
      options: ['80', '443', '8080', '22'],
      correctIndex: 1,
      explanation: 'Port 443 is the standard registered port for encrypted HTTPS web traffic.',
    },
    {
      topic: 'networks',
      topicDisplay: 'Networks',
      difficulty: 'medium',
      text: 'In the TCP 3-way handshake to establish a connection, what flags are sent by the server in response to the initial SYN?',
      options: ['ACK only', 'SYN only', 'SYN + ACK', 'FIN + ACK'],
      correctIndex: 2,
      explanation: 'The server responds to SYN by sending back its own sequence number with SYN and acknowledging the client with ACK (SYN-ACK).',
    },
    {
      topic: 'networks',
      topicDisplay: 'Networks',
      difficulty: 'medium',
      text: 'Which DNS record type specifies the mail server responsible for accepting messages on behalf of a domain?',
      options: ['A', 'CNAME', 'MX', 'TXT'],
      correctIndex: 2,
      explanation: 'MX (Mail Exchanger) records route incoming email to the designated mail servers for a domain name.',
    },
    {
      topic: 'networks',
      topicDisplay: 'Networks',
      difficulty: 'hard',
      text: 'In TCP congestion control, what triggers the transition from Slow Start to Congestion Avoidance?',
      options: ['Congestion window (cwnd) reaches ssthresh', 'Receiving a single ACK', 'Zero duplicate ACKs', 'RTT timeout doubling'],
      correctIndex: 0,
      explanation: 'Once cwnd >= ssthresh (slow start threshold), TCP transitions from exponential window growth (Slow Start) to linear growth (Congestion Avoidance).',
    },
    {
      topic: 'networks',
      topicDisplay: 'Networks',
      difficulty: 'hard',
      text: 'What algorithm is used by Open Shortest Path First (OSPF) to calculate the shortest path tree in an autonomous system?',
      options: ['Bellman-Ford Algorithm', 'Dijkstra Algorithm', 'Floyd-Warshall Algorithm', 'Kruskal Algorithm'],
      correctIndex: 1,
      explanation: 'OSPF is a link-state routing protocol where each router uses Dijkstra\'s Shortest Path First (SPF) algorithm to calculate loop-free paths.',
    },

    // TOPIC: JavaScript
    {
      topic: 'javascript',
      topicDisplay: 'JavaScript',
      difficulty: 'easy',
      text: 'What is the output of `typeof null` in standard JavaScript?',
      options: ['"null"', '"undefined"', '"object"', '"boolean"'],
      correctIndex: 2,
      explanation: 'Due to a historical bug in the first implementation of JavaScript where objects were tagged with type tag 0 and null was pointer NULL (0), typeof null returns "object".',
    },
    {
      topic: 'javascript',
      topicDisplay: 'JavaScript',
      difficulty: 'easy',
      text: 'Which array method creates a new array populated with the results of calling a provided function on every element?',
      options: ['forEach()', 'filter()', 'map()', 'reduce()'],
      correctIndex: 2,
      explanation: 'Array.prototype.map() transforms each element of an array according to a callback function and returns a brand-new array.',
    },
    {
      topic: 'javascript',
      topicDisplay: 'JavaScript',
      difficulty: 'medium',
      text: 'What is a closure in JavaScript?',
      options: [
        'A function combined with references to its surrounding lexical environment',
        'A method that immediately cancels asynchronous execution',
        'An anonymous function that cannot return values',
        'A function that executes only once and terminates the browser process',
      ],
      correctIndex: 0,
      explanation: 'A closure is the combination of a function bundled together with references to its lexical environment, allowing it to access outer variables even after the outer function has returned.',
    },
    {
      topic: 'javascript',
      topicDisplay: 'JavaScript',
      difficulty: 'medium',
      text: 'What order are Microtasks (Promise callbacks) executed relative to Macrotasks (setTimeout callbacks)?',
      options: [
        'All Macrotasks execute before any Microtasks',
        'The microtask queue is completely drained after each macrotask and before rendering',
        'They execute in alternating round-robin order',
        'Microtasks only run when the call stack has 10+ frames',
      ],
      correctIndex: 1,
      explanation: 'The event loop processes one macrotask from the task queue, then completely flushes the microtask queue (Promise.then, MutationObserver) before rendering or moving to the next macrotask.',
    },
    {
      topic: 'javascript',
      topicDisplay: 'JavaScript',
      difficulty: 'hard',
      text: 'What does `Object.freeze()` do compared to `Object.seal()`?',
      options: [
        'Object.freeze() makes properties read-only, whereas Object.seal() allows modifying existing writable property values',
        'Object.seal() prevents additions but allows deletions, while Object.freeze() prevents both',
        'Both are strictly identical',
        'Object.freeze() is shallow, while Object.seal() is deep recursive',
      ],
      correctIndex: 0,
      explanation: 'Object.seal() prevents adding or deleting properties but allows modifying existing writable properties. Object.freeze() also sets writable to false on existing properties.',
    },
    {
      topic: 'javascript',
      topicDisplay: 'JavaScript',
      difficulty: 'hard',
      text: 'What is the return value of `Promise.allSettled([Promise.resolve(1), Promise.reject("err")])`?',
      options: [
        'Rejects immediately with "err"',
        'Resolves with an array of outcome objects: [{status: "fulfilled", value: 1}, {status: "rejected", reason: "err"}]',
        'Throws an unhandled exception',
        'Resolves with [1, null]',
      ],
      correctIndex: 1,
      explanation: 'Promise.allSettled() never short-circuits on rejection; it waits for all promises to settle and returns an array of status objects with value or reason.',
    },
  ];

  const createdQuestions = [];
  for (const q of rawQuestions) {
    const created = await Question.create({
      ...q,
      createdBy: moderator._id,
      status: 'approved',
      moderationNote: 'Pre-approved question bank standard',
      moderatedBy: moderator._id,
      moderatedAt: new Date(),
    });
    createdQuestions.push(created);
  }

  // 3. Pending Questions
  await Question.create([
    {
      topic: 'dbms',
      topicDisplay: 'DBMS',
      difficulty: 'easy',
      text: 'Which SQL keyword is used to sort the result-set in ascending or descending order?',
      options: ['SORT BY', 'ORDER BY', 'GROUP BY', 'ARRANGE BY'],
      correctIndex: 1,
      explanation: 'ORDER BY sorts the query results in ascending (default) or descending order.',
      createdBy: student1._id,
      status: 'pending',
    },
    {
      topic: 'operating systems',
      topicDisplay: 'Operating Systems',
      difficulty: 'medium',
      text: 'What is a daemon process in Unix/Linux systems?',
      options: [
        'A malicious program that crashes the kernel',
        'A background process that runs unattended to perform system tasks',
        'A foreground UI thread',
        'A CPU register caching process',
      ],
      correctIndex: 1,
      explanation: 'Daemons are background services that typically start at boot time and handle requests such as printing, network routing, or cron jobs.',
      createdBy: student2._id,
      status: 'pending',
    },
    {
      topic: 'networks',
      topicDisplay: 'Networks',
      difficulty: 'hard',
      text: 'What is the size of an IPv6 address in bits?',
      options: ['32 bits', '64 bits', '128 bits', '256 bits'],
      correctIndex: 2,
      explanation: 'IPv6 uses 128-bit addresses, represented as eight groups of four hexadecimal digits.',
      createdBy: student1._id,
      status: 'pending',
    },
  ]);

  // 4. Pre-built Quizzes
  const csCoreQuestions = createdQuestions.slice(0, 10).map((q) => q._id);
  const dbmsQuestions = createdQuestions.filter((q) => q.topic === 'dbms').map((q) => q._id);
  const netQuestions = createdQuestions.filter((q) => q.topic === 'networks').map((q) => q._id);
  const jsQuestions = createdQuestions.filter((q) => q.topic === 'javascript').map((q) => q._id);

  const quizCore = await Quiz.create({
    title: 'Computer Science Core Essentials',
    description: 'Test your grasp on Data Structures and Database fundamentals.',
    createdBy: moderator._id,
    questions: csCoreQuestions,
    filters: { topic: 'Data Structures, DBMS', difficulty: 'all', count: 10 },
    isPublic: true,
  });

  const quizDbms = await Quiz.create({
    title: 'DBMS Mastery Sprint',
    description: 'Comprehensive evaluation of Relational Database Management Concepts.',
    createdBy: moderator._id,
    questions: dbmsQuestions,
    filters: { topic: 'DBMS', difficulty: 'all', count: 6 },
    isPublic: true,
  });

  const quizNetworks = await Quiz.create({
    title: 'Computer Networks Deep Dive',
    description: 'Protocols, TCP/IP stack, routing algorithms, and socket operations.',
    createdBy: moderator._id,
    questions: netQuestions,
    filters: { topic: 'Networks', difficulty: 'all', count: 6 },
    isPublic: true,
  });

  const quizJS = await Quiz.create({
    title: 'Modern JavaScript & Event Loop',
    description: 'Closures, Event Loop mechanics, async promises, and object model.',
    createdBy: student1._id,
    questions: jsQuestions,
    filters: { topic: 'JavaScript', difficulty: 'all', count: 6 },
    isPublic: true,
  });

  // 5. Seed Attempts for student1 (deliberately making DBMS and Networks WEAK TOPICS)
  const qByTopic = {};
  for (const q of createdQuestions) {
    if (!qByTopic[q.topic]) qByTopic[q.topic] = [];
    qByTopic[q.topic].push(q);
  }

  const dbmsQ = qByTopic['dbms'];
  const netQ = qByTopic['networks'];
  const dsQ = qByTopic['data structures'];
  const jsQ = qByTopic['javascript'];
  const osQ = qByTopic['operating systems'];

  // Attempt 1: DBMS Quiz (Student1 scores 1 out of 5 -> 20% accuracy, 4 incorrect => WEAK)
  const dbmsAnswers = [
    { question: dbmsQ[0]._id, selectedIndex: 1, isCorrect: true, topic: 'dbms', topicDisplay: 'DBMS' },
    { question: dbmsQ[1]._id, selectedIndex: 0, isCorrect: false, topic: 'dbms', topicDisplay: 'DBMS' },
    { question: dbmsQ[2]._id, selectedIndex: 0, isCorrect: false, topic: 'dbms', topicDisplay: 'DBMS' },
    { question: dbmsQ[3]._id, selectedIndex: 0, isCorrect: false, topic: 'dbms', topicDisplay: 'DBMS' },
    { question: dbmsQ[4]._id, selectedIndex: 1, isCorrect: false, topic: 'dbms', topicDisplay: 'DBMS' },
  ];
  await Attempt.create({
    user: student1._id,
    quiz: quizDbms._id,
    answers: dbmsAnswers,
    score: 1,
    total: 5,
    percentage: 20,
    durationSeconds: 145,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  });

  // Attempt 2: Networks Quiz (Student1 scores 1 out of 4 -> 25% accuracy, 3 incorrect => WEAK)
  const netAnswers = [
    { question: netQ[0]._id, selectedIndex: 2, isCorrect: true, topic: 'networks', topicDisplay: 'Networks' },
    { question: netQ[1]._id, selectedIndex: 0, isCorrect: false, topic: 'networks', topicDisplay: 'Networks' },
    { question: netQ[2]._id, selectedIndex: 0, isCorrect: false, topic: 'networks', topicDisplay: 'Networks' },
    { question: netQ[4]._id, selectedIndex: 2, isCorrect: false, topic: 'networks', topicDisplay: 'Networks' },
  ];
  await Attempt.create({
    user: student1._id,
    quiz: quizNetworks._id,
    answers: netAnswers,
    score: 1,
    total: 4,
    percentage: 25,
    durationSeconds: 120,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  });

  // Attempt 3: JavaScript Quiz (5 out of 6 -> 83% accuracy => STRONG)
  const strongAnswers = [
    { question: dsQ[0]._id, selectedIndex: 1, isCorrect: true, topic: 'data structures', topicDisplay: 'Data Structures' },
    { question: dsQ[1]._id, selectedIndex: 0, isCorrect: true, topic: 'data structures', topicDisplay: 'Data Structures' },
    { question: dsQ[2]._id, selectedIndex: 1, isCorrect: true, topic: 'data structures', topicDisplay: 'Data Structures' },
    { question: jsQ[0]._id, selectedIndex: 2, isCorrect: true, topic: 'javascript', topicDisplay: 'JavaScript' },
    { question: jsQ[1]._id, selectedIndex: 2, isCorrect: true, topic: 'javascript', topicDisplay: 'JavaScript' },
    { question: jsQ[2]._id, selectedIndex: 3, isCorrect: false, topic: 'javascript', topicDisplay: 'JavaScript' },
  ];
  await Attempt.create({
    user: student1._id,
    quiz: quizJS._id,
    answers: strongAnswers,
    score: 5,
    total: 6,
    percentage: 83,
    durationSeconds: 180,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  });

  // Attempt 4: Operating Systems (3 out of 4 -> 75% accuracy => STABLE)
  const osAnswers = [
    { question: osQ[0]._id, selectedIndex: 1, isCorrect: true, topic: 'operating systems', topicDisplay: 'Operating Systems' },
    { question: osQ[1]._id, selectedIndex: 2, isCorrect: true, topic: 'operating systems', topicDisplay: 'Operating Systems' },
    { question: osQ[2]._id, selectedIndex: 2, isCorrect: true, topic: 'operating systems', topicDisplay: 'Operating Systems' },
    { question: osQ[3]._id, selectedIndex: 1, isCorrect: false, topic: 'operating systems', topicDisplay: 'Operating Systems' },
  ];
  await Attempt.create({
    user: student1._id,
    quiz: quizCore._id,
    answers: osAnswers,
    score: 3,
    total: 4,
    percentage: 75,
    durationSeconds: 110,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  });

  console.log('[SeedLogic] Seeding successfully finished.');
};

module.exports = { seedDatabase };
