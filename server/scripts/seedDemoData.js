require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../models/User');
const Post = require('../models/Post');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

const DEMO_DOMAIN = 'campuswire.demo';
const DEMO_PASSWORD = 'Campus@123';
const USER_COUNT = 64;
const POST_COUNT = 120;
const MESSAGE_COUNT = 48;

const firstNames = [
  'Aarav', 'Priya', 'Rohan', 'Sneha', 'Kabir', 'Ananya', 'Ishaan', 'Meera',
  'Arjun', 'Nisha', 'Vihaan', 'Tara', 'Aditya', 'Kavya', 'Reyansh', 'Ira',
  'Dev', 'Aisha', 'Rahul', 'Simran', 'Karan', 'Pooja', 'Aryan', 'Diya',
  'Neel', 'Riya', 'Vivaan', 'Sanya', 'Manav', 'Avni', 'Yash', 'Zoya',
];

const lastNames = [
  'Sharma', 'Mehta', 'Verma', 'Iyer', 'Kapoor', 'Nair', 'Gupta', 'Menon',
  'Reddy', 'Khan', 'Patel', 'Singh', 'Das', 'Joshi', 'Bose', 'Rao',
  'Malhotra', 'Chopra', 'Saxena', 'Bhat', 'Pillai', 'Agarwal', 'Thomas', 'Gill',
  'Kulkarni', 'Banerjee', 'Shetty', 'Mishra', 'Sethi', 'Roy', 'Ghosh', 'Bajaj',
];

const bios = [
  'Computer Science student building full-stack projects.',
  'Campus club volunteer and event coordinator.',
  'Learning data structures, design, and product thinking.',
  'Faculty mentor for student projects and research groups.',
  'Interested in AI, startups, and hackathons.',
  'Working on open-source tools after class.',
  'Designing better workflows for student communities.',
  'Part of the coding club and weekend study circles.',
  'Exploring cloud, APIs, and realtime applications.',
  'Always up for team projects and campus events.',
  'Sharing notes, resources, and placement preparation tips.',
  'Building tiny apps to solve campus problems.',
];

const postTemplates = [
  'Anyone joining the web development workshop this evening?',
  'Looking for two teammates for the upcoming hackathon.',
  'Shared my notes from today in the study group. Hope they help.',
  'The project showcase deadline is closer than it feels.',
  'Great discussion in class today about system design basics.',
  'Can someone recommend beginner-friendly resources for MongoDB?',
  'Campus fest volunteers are meeting near the auditorium at 4 PM.',
  'Finished the first version of my portfolio project today.',
  'Does anyone want to practice mock interviews this weekend?',
  'The library study room is open late during exams this week.',
  'Trying to understand JWT auth better. Any good examples?',
  'Our club is planning a beginner React session next Friday.',
  'Group study for algorithms tomorrow after lunch.',
  'Found a clean way to structure Express controllers today.',
  'Reminder to update your profile before the community showcase.',
  'The photography club is taking portraits for student profiles.',
  'Anyone interested in presenting a mini project next week?',
  'Working on socket-based messaging. Realtime UI is surprisingly fun.',
  'Placement prep circle starts at 6 PM in lab 2.',
  'What features should a campus social app have next?',
];

const commentTemplates = [
  'Count me in.',
  'This is helpful, thanks.',
  'I can join after class.',
  'Please share the link.',
  'Nice work.',
  'I was looking for this.',
  'Let us do it.',
  'Can you add me too?',
];

const messageTemplates = [
  'Hey, are you joining the workshop today?',
  'Yes, I will be there after class.',
  'Can you send me the project repo link?',
  'Sure, I will share it in a bit.',
  'Do you want to pair for the hackathon?',
  'That sounds good. Let us discuss ideas tomorrow.',
  'I liked your post about the React session.',
  'Thanks. I am preparing a small demo for it.',
];

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');

const usernameFor = (text, index = 0) =>
  `${slugify(text).replace(/\./g, '_')}${index ? `_${index}` : ''}`.slice(0, 30);

const pick = (items, index) => items[index % items.length];

const minutesAgo = (minutes) => new Date(Date.now() - minutes * 60 * 1000);

function buildDemoProfiles() {
  const profiles = [
    {
      name: 'CampusWire Office',
      username: 'campuswire_office',
      email: `campuswire.office@${DEMO_DOMAIN}`,
      role: 'admin',
      bio: 'Official updates, announcements, and campus community highlights.',
    },
  ];

  for (let index = 0; index < USER_COUNT - 1; index += 1) {
    const firstName = pick(firstNames, index);
    const lastName = pick(lastNames, index * 7 + index);
    const name = `${firstName} ${lastName}`;

    profiles.push({
      name,
      username: usernameFor(name, index + 1),
      email: `${slugify(name)}.${index + 1}@${DEMO_DOMAIN}`,
      role: 'participant',
      bio: pick(bios, index),
    });
  }

  return profiles;
}

async function resetDemoData() {
  const demoUsers = await User.find({ email: new RegExp(`@${DEMO_DOMAIN}$`) }).select('_id');
  const demoIds = demoUsers.map((user) => user._id);

  if (!demoIds.length) return;

  await Promise.all([
    Notification.deleteMany({
      $or: [{ recipient: { $in: demoIds } }, { sender: { $in: demoIds } }],
    }),
    Message.deleteMany({
      $or: [{ sender: { $in: demoIds } }, { receiver: { $in: demoIds } }],
    }),
    Post.deleteMany({ author: { $in: demoIds } }),
  ]);

  await User.updateMany(
    { _id: { $nin: demoIds } },
    { $pull: { followers: { $in: demoIds }, following: { $in: demoIds } } }
  );
  await User.deleteMany({ _id: { $in: demoIds } });
}

async function seedUsers() {
  const profiles = buildDemoProfiles();
  const users = [];

  for (const profile of profiles) {
    let user = await User.findOne({ email: profile.email });

    if (!user) {
      user = await User.create({
        ...profile,
        password: DEMO_PASSWORD,
        profilePic: {
          url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name)}`,
          public_id: '',
        },
      });
    } else {
      user.name = profile.name;
      user.username = profile.username;
      user.bio = profile.bio;
      user.role = profile.role;
      user.isActive = true;
      user.profilePic = {
        url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name)}`,
        public_id: '',
      };
      await user.save({ validateBeforeSave: false });
    }

    users.push(user);
  }

  return users;
}

async function seedFollowGraph(users) {
  const userIds = users.map((user) => user._id);

  for (let index = 0; index < users.length; index += 1) {
    const following = [];
    for (let offset = 1; offset <= 7; offset += 1) {
      following.push(userIds[(index + offset) % userIds.length]);
    }

    await User.updateOne(
      { _id: users[index]._id },
      { $addToSet: { following: { $each: following } } }
    );

    await User.updateMany(
      { _id: { $in: following } },
      { $addToSet: { followers: users[index]._id } }
    );
  }
}

async function seedPosts(users) {
  const userIds = users.map((user) => user._id);
  const existingPosts = await Post.countDocuments({ author: { $in: userIds } });
  if (existingPosts > 0) return 0;

  const posts = [];
  const admin = users[0];

  for (let index = 0; index < POST_COUNT; index += 1) {
    const author = index % 10 === 0 ? admin : users[(index % (users.length - 1)) + 1];
    const likeCount = (index % 9) + 2;
    const likes = [];
    const comments = [];

    for (let likeIndex = 0; likeIndex < likeCount; likeIndex += 1) {
      likes.push(userIds[(index + likeIndex + 3) % userIds.length]);
    }

    for (let commentIndex = 0; commentIndex < index % 4; commentIndex += 1) {
      comments.push({
        user: userIds[(index + commentIndex + 8) % userIds.length],
        text: pick(commentTemplates, index + commentIndex),
        createdAt: minutesAgo(index * 37 + commentIndex * 11),
      });
    }

    posts.push({
      author: author._id,
      content: pick(postTemplates, index),
      likes,
      comments,
      isBroadcast: author._id.toString() === admin._id.toString(),
      createdAt: minutesAgo(index * 53 + 15),
    });
  }

  await Post.insertMany(posts);
  return posts.length;
}

async function seedMessages(users) {
  const userIds = users.map((user) => user._id);
  const existingMessages = await Message.countDocuments({
    $or: [{ sender: { $in: userIds } }, { receiver: { $in: userIds } }],
  });
  if (existingMessages > 0) return 0;

  const messages = [];

  for (let index = 0; index < MESSAGE_COUNT; index += 1) {
    const sender = users[(index % (users.length - 1)) + 1];
    const receiver = users[((index + 5) % (users.length - 1)) + 1];

    if (sender._id.toString() === receiver._id.toString()) continue;

    messages.push({
      sender: sender._id,
      receiver: receiver._id,
      content: pick(messageTemplates, index),
      isRead: index % 3 !== 0,
      createdAt: minutesAgo(index * 29 + 7),
    });
  }

  await Message.insertMany(messages);
  return messages.length;
}

async function main() {
  const shouldReset = process.argv.includes('--reset');

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required to seed demo data.');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  if (shouldReset) {
    console.log('Resetting existing CampusWire demo data');
    await resetDemoData();
  }

  const users = await seedUsers();
  await seedFollowGraph(users);
  const postsCreated = await seedPosts(users);
  const messagesCreated = await seedMessages(users);

  console.log(`Demo users ready: ${users.length}`);
  console.log(`Demo posts created: ${postsCreated}`);
  console.log(`Demo messages created: ${messagesCreated}`);
  console.log(`Demo login password for seeded users: ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
