db = db.getSiblingDB('note-app');

db.createCollection('users');
db.createCollection('notes');

// Optional: insert sample documents
db.users.insertOne({
  username: 'admin@admin.com',
  password: '123456789',
});

db.notes.insertOne({
  title: 'Welcome Note',
  content: 'This is your first note!',
});
