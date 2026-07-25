'use strict';
/**
 * seedEssentials.js — Seeds the minimum data needed for ACLC to work:
 *   1. DailyTip (dashboard tip card)
 *   2. Assessment questions (student assessment page)
 *   3. PrelimsTest questions (onboarding adaptive assessment)
 *
 * Run once after connecting to a fresh MongoDB:
 *   node seedEssentials.js
 */

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const mongoose    = require('mongoose');
const DailyTip    = require('./models/DailyTip');
const Assessment  = require('./models/Assessment');
const PrelimsTest = require('./models/PrelimsTest');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  console.log('✅ Connected to MongoDB');

  // ── 1. DailyTip ────────────────────────────────────────────
  const tipCount = await DailyTip.countDocuments();
  if (tipCount === 0) {
    await DailyTip.insertMany([
      { title: 'Daily Study Tip 💡', content: 'Break complex tasks into 15-minute chunks for better cognitive retention.' },
      { title: 'Focus Tip 🎯',       content: 'Use the Pomodoro Technique: 25 minutes of focus, then a 5-minute break.' },
      { title: 'Reading Tip 📖',     content: 'Try increasing line-spacing in accessibility settings to reduce reading fatigue.' },
    ]);
    console.log('✅ DailyTip seeded (3 tips)');
  } else {
    console.log(`ℹ️  DailyTip skipped — ${tipCount} already exist`);
  }

  // ── 2. Assessment Questions ────────────────────────────────
  const ClassModel = require('./models/Class');
  const UserModel  = require('./models/User');
  const assessCount = await Assessment.countDocuments();
  
  if (assessCount === 0) {
    const demoClass = await ClassModel.findOne();
    const demoTeacher = await UserModel.findOne({ role: 'TEACHER' });

    const samplePublishedAssessments = [
      {
        title: 'Mathematics Mid-Term Evaluation',
        subject: 'Mathematics',
        duration: 45,
        scheduledDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
        startTime: '09:30 AM',
        endTime: '10:15 AM',
        status: 'Upcoming',
        isPublished: true,
        classId: demoClass?._id,
        teacherId: demoTeacher?._id,
        questions: [
          { question: 'What comes next: 2, 4, 6, __?', type: 'mcq', options: ['7','8','9','10'], correctAnswer: '8', difficulty: 'easy', hint: 'Add 2 each time.' },
          { question: 'What is 5 × 3?', type: 'mcq', options: ['12','15','18','20'], correctAnswer: '15', difficulty: 'easy', hint: 'Count by 5s three times.' },
          { question: 'What is the square root of 64?', type: 'mcq', options: ['6','7','8','9'], correctAnswer: '8', difficulty: 'medium', hint: '8 × 8 = ?' },
          { question: 'Solve for x: 3x + 5 = 20', type: 'mcq', options: ['3','4','5','6'], correctAnswer: '5', difficulty: 'challenge', hint: 'Subtract 5 from both sides first.' }
        ]
      },
      {
        title: 'Science & Nature Knowledge Test',
        subject: 'Science',
        duration: 30,
        scheduledDate: new Date(),
        startTime: '11:00 AM',
        endTime: '11:30 AM',
        status: 'Active',
        isPublished: true,
        classId: demoClass?._id,
        teacherId: demoTeacher?._id,
        questions: [
          { question: 'Which planet is known as the Red Planet?', type: 'mcq', options: ['Earth','Mars','Jupiter','Venus'], correctAnswer: 'Mars', difficulty: 'medium', hint: 'Named after the Roman god of war.' },
          { question: 'Describe what photosynthesis is.', type: 'text', options: [], correctAnswer: 'open', difficulty: 'medium', hint: 'Think about sunlight and plants.' }
        ]
      }
    ];

    if (demoClass && demoTeacher) {
      await Assessment.insertMany(samplePublishedAssessments);
      console.log('✅ Published classroom assessments seeded (2 assessments)');
    } else {
      await Assessment.insertMany([
        { question: 'What comes next: 2, 4, 6, __?', type: 'mcq', options: ['7','8','9','10'], correctAnswer: '8', difficulty: 'easy', hint: 'Add 2 each time.' },
        { question: 'Which word is a noun: Run, Happy, School, Quickly?', type: 'mcq', options: ['Run','Happy','School','Quickly'], correctAnswer: 'School', difficulty: 'easy', hint: 'A noun is a person, place, or thing.' },
        { question: 'What is 5 × 3?', type: 'mcq', options: ['12','15','18','20'], correctAnswer: '15', difficulty: 'easy', hint: 'Count by 5s three times.' }
      ]);
      console.log('✅ Base assessment questions seeded');
    }
  } else {
    console.log(`ℹ️  Assessment skipped — ${assessCount} already exist`);
  }

  // ── 3. Prelims Test Questions ──────────────────────────────
  const prelimsCount = await PrelimsTest.countDocuments();
  if (prelimsCount === 0) {
    await PrelimsTest.insertMany([
      // reading-speed pattern
      { question: 'Read the following and answer: "The cat sat on the mat and ate a hat." What did the cat eat?', type: 'mcq', options: ['A mat','A hat','A bat','A rat'], correctAnswer: 'A hat', patternTag: 'reading-speed' },
      { question: 'Which of these words rhymes with "light"?', type: 'mcq', options: ['Late','Night','Lot','Lane'], correctAnswer: 'Night', patternTag: 'reading-speed' },
      { question: 'Arrange these words into a sentence: "quickly / the / ran / dog"', type: 'text', options: [], correctAnswer: 'the dog ran quickly', patternTag: 'reading-speed' },

      // numerical pattern
      { question: 'What is 12 + 7?', type: 'mcq', options: ['17','18','19','20'], correctAnswer: '19', patternTag: 'numerical' },
      { question: 'Which number is largest: 45, 54, 44, 55?', type: 'mcq', options: ['45','54','44','55'], correctAnswer: '55', patternTag: 'numerical' },
      { question: 'Count the dots: ●●●●●●●●. How many?', type: 'mcq', options: ['6','7','8','9'], correctAnswer: '8', patternTag: 'numerical' },

      // attention pattern
      { question: 'Find the different letter: A A A A B A A A', type: 'mcq', options: ['First A','The B','Last A','All same'], correctAnswer: 'The B', patternTag: 'attention' },
      { question: 'How many times does the letter "e" appear in: "The elephant entered the enclosure"?', type: 'mcq', options: ['5','6','7','8'], correctAnswer: '7', patternTag: 'attention' },

      // logical pattern
      { question: 'If all cats are animals, and Tom is a cat, then Tom is a...?', type: 'mcq', options: ['Plant','Animal','Mineral','Human'], correctAnswer: 'Animal', patternTag: 'logical' },
      { question: 'What comes next: Circle, Square, Triangle, Circle, Square, ___?', type: 'mcq', options: ['Circle','Square','Triangle','Rectangle'], correctAnswer: 'Triangle', patternTag: 'logical' },

      // spatial pattern
      { question: 'If you rotate the letter "d" by 180°, it looks like:', type: 'mcq', options: ['b','p','q','d'], correctAnswer: 'q', patternTag: 'spatial' },
      { question: 'Which shape has 4 equal sides and 4 right angles?', type: 'mcq', options: ['Rectangle','Rhombus','Square','Trapezoid'], correctAnswer: 'Square', patternTag: 'spatial' },

      // memory pattern
      { question: 'Remember this sequence: 3, 7, 2, 8. What was the second number?', type: 'mcq', options: ['3','7','2','8'], correctAnswer: '7', patternTag: 'memory' },
      { question: 'A list had: Apple, Banana, Cherry, Date. What was the third item?', type: 'mcq', options: ['Apple','Banana','Cherry','Date'], correctAnswer: 'Cherry', patternTag: 'memory' },
    ]);
    console.log('✅ PrelimsTest questions seeded (13 questions)');
  } else {
    console.log(`ℹ️  PrelimsTest skipped — ${prelimsCount} already exist`);
  }

  console.log('\n🎉 Seed complete. You can now register and use the app.');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
