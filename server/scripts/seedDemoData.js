require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

const User = require('../models/User');
const Post = require('../models/Post');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const UsernameReservation = require('../models/UsernameReservation');

const DEMO_DOMAIN = 'campuswire.demo';
const DEMO_PASSWORD = 'Campus@123';
const USER_COUNT = Number(process.env.DEMO_USER_COUNT || 500);
const POST_COUNT = Number(process.env.DEMO_POST_COUNT || 900);
const MESSAGE_COUNT = Number(process.env.DEMO_MESSAGE_COUNT || 350);
const NOTIFICATION_COUNT = Number(process.env.DEMO_NOTIFICATION_COUNT || 600);
const DEMO_ONLINE_COUNT = Number(process.env.DEMO_ONLINE_COUNT || 80);

const reactionTypes = ['like', 'love', 'celebrate', 'helpful', 'curious'];

dns.setServers((process.env.DNS_SERVERS || '8.8.8.8,1.1.1.1').split(','));

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
  'CS student. Department: Computer Science. Batch: 2027. Interests: AI, Hackathons, Clubs.',
  'Campus volunteer. Department: Student Affairs. Batch: 2026. Interests: Events, Clubs.',
  'Learning DSA and product thinking. Department: IT. Batch: 2027. Interests: Placements.',
  'Faculty mentor for student projects. Department: CSE. Interests: Research, Events.',
  'Interested in AI and startups. Department: ECE. Batch: 2026. Interests: AI, Startups.',
  'Open-source after class. Department: IT. Batch: 2025. Interests: Research, AI.',
  'Designing better campus workflows. Department: Design. Batch: 2027. Interests: Clubs.',
  'Coding club and study circles. Department: CSE. Batch: 2028. Interests: Academics.',
  'Exploring cloud and realtime apps. Department: CSE. Batch: 2026. Interests: AI.',
  'Always up for team projects. Department: EEE. Batch: 2027. Interests: Events.',
  'Sharing notes and placement tips. Department: IT. Batch: 2025. Interests: Placements.',
  'Building tiny campus apps. Department: CSE. Batch: 2028. Interests: Startups.',
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
  'New students can use CampusWire onboarding to add department, batch, and interests.',
  'Try the upgraded reactions. One person, one reaction, clean count.',
  'Admin broadcast preview looks much clearer now.',
  'Message fallback states are ready for weak network days.',
  'The report and save UI shells are a good start for moderation workflows.',
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
  'The new onboarding screen looks useful for freshers.',
  'Can you check the broadcast preview before we send it?',
  'I saw your reaction on the announcement.',
  'Let us test chat from the messages page.',
];

const notificationMessages = [
  'reacted with love',
  'found this helpful',
  'shared your post',
  'mentioned your announcement',
  'started following you',
  'commented on your campus update',
];

const postImageUrls = [
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
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

const postImageFor = (index) => ({
  url: `${pick(postImageUrls, index)}&ixid=campuswire-demo-${index}`,
  public_id: '',
});

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
  const profiles = buildDemoProfiles();
  const demoUsernames = profiles.map((profile) => profile.username);
  const demoUsers = await User.find({ email: new RegExp(`@${DEMO_DOMAIN}$`) }).select('_id');
  const demoIds = demoUsers.map((user) => user._id);

  if (!demoIds.length) {
    await UsernameReservation.deleteMany({ username: { $in: demoUsernames } });
    return;
  }

  await Promise.all([
    Notification.deleteMany({
      $or: [{ recipient: { $in: demoIds } }, { sender: { $in: demoIds } }],
    }),
    Message.deleteMany({
      $or: [{ sender: { $in: demoIds } }, { receiver: { $in: demoIds } }],
    }),
    Post.deleteMany({ author: { $in: demoIds } }),
    UsernameReservation.deleteMany({ $or: [{ user: { $in: demoIds } }, { username: { $in: demoUsernames } }] }),
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
        isEmailVerified: true,
        isDemoOnline: users.length > 0 && users.length <= DEMO_ONLINE_COUNT,
        profilePic: {
          url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name)}`,
          public_id: '',
        },
        coverPic: {
          url: `https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80&seed=${encodeURIComponent(profile.username)}`,
          public_id: '',
        },
      });
    } else {
      user.name = profile.name;
      user.username = profile.username;
      user.bio = profile.bio;
      user.role = profile.role;
      user.isActive = true;
      user.isEmailVerified = true;
      user.isDemoOnline = users.length > 0 && users.length <= DEMO_ONLINE_COUNT;
      user.profilePic = {
        url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name)}`,
        public_id: '',
      };
      user.coverPic = {
        url: `https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80&seed=${encodeURIComponent(profile.username)}`,
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
  if (existingPosts > 0) {
    const demoPosts = await Post.find({ author: { $in: userIds } });
    let upgraded = 0;
    for (let index = 0; index < demoPosts.length; index += 1) {
      const post = demoPosts[index];
      let changed = false;
      if (!post.reactions?.length) {
        const legacyLikes = post.likes?.length ? post.likes : userIds.slice(2, 7);
        post.reactions = legacyLikes.slice(0, 8).map((id, likeIndex) => ({
          user: id,
          type: pick(reactionTypes, index + likeIndex),
          createdAt: minutesAgo(index * 34 + likeIndex * 7),
        }));
        post.likes = post.reactions.filter((reaction) => reaction.type === 'like').map((reaction) => reaction.user);
        changed = true;
      }
      if (!post.image?.url) {
        post.image = postImageFor(index);
        changed = true;
      }
      if (changed) {
        await post.save({ validateBeforeSave: false });
        upgraded += 1;
      }
    }
    return upgraded;
  }

  const posts = [];
  const admin = users[0];

  for (let index = 0; index < POST_COUNT; index += 1) {
    const author = index % 10 === 0 ? admin : users[(index % (users.length - 1)) + 1];
    const likeCount = (index % 9) + 2;
    const likes = [];
    const reactions = [];
    const comments = [];

    for (let likeIndex = 0; likeIndex < likeCount; likeIndex += 1) {
      const reactionUser = userIds[(index + likeIndex + 3) % userIds.length];
      const type = pick(reactionTypes, index + likeIndex);
      reactions.push({
        user: reactionUser,
        type,
        createdAt: minutesAgo(index * 34 + likeIndex * 7),
      });
      if (type === 'like') likes.push(reactionUser);
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
      reactions,
      comments,
      image: postImageFor(index),
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

async function seedNotifications(users) {
  const userIds = users.map((user) => user._id);
  const existingNotifications = await Notification.countDocuments({
    $or: [{ recipient: { $in: userIds } }, { sender: { $in: userIds } }],
  });
  if (existingNotifications > 0) return 0;

  const posts = await Post.find({ author: { $in: userIds } }).select('_id author isBroadcast').limit(POST_COUNT);
  if (!posts.length) return 0;

  const notifications = [];

  for (let index = 0; index < NOTIFICATION_COUNT; index += 1) {
    const post = posts[index % posts.length];
    const sender = users[(index % (users.length - 1)) + 1];
    const recipient = users[((index + 9) % (users.length - 1)) + 1];
    const type = post.isBroadcast
      ? 'broadcast'
      : pick(['like', 'reaction', 'comment', 'share', 'follow'], index);

    notifications.push({
      recipient: type === 'broadcast' ? recipient._id : (post.author || recipient._id),
      sender: type === 'broadcast' ? users[0]._id : sender._id,
      type,
      post: type === 'follow' ? undefined : post._id,
      message: pick(notificationMessages, index),
      isRead: index % 4 === 0,
      createdAt: minutesAgo(index * 17 + 4),
    });
  }

  await Notification.insertMany(notifications);
  return notifications.length;
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
  const notificationsCreated = await seedNotifications(users);

  console.log(`Demo users ready: ${users.length}`);
  console.log(`Demo posts created: ${postsCreated}`);
  console.log(`Demo messages created: ${messagesCreated}`);
  console.log(`Demo notifications created: ${notificationsCreated}`);
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
