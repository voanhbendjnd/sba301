export const defaultSettings = { displayName: 'Administrator', publicationName: 'FU Newsroom' };

export function createSeed() {
  return {
    categories: [
      {
        id: 'cat-campus',
        name: 'Campus life',
        description: 'Stories from our university community.',
        status: 1,
      },
      {
        id: 'cat-academic',
        name: 'Academics',
        description: 'Learning, research and academic achievements.',
        status: 1,
      },
      { id: 'cat-events', name: 'Events', description: 'What is happening on campus.', status: 1 },
      {
        id: 'cat-career',
        name: 'Career',
        description: 'Opportunities for your next chapter.',
        status: 0,
      },
    ],
    users: [
      { id: 'user-admin', username: 'Admin', password: 'Admin', role: 1, status: 1 },
      { id: 'user-linh', username: 'linh.editor', password: 'Demo123', role: 2, status: 1 },
      { id: 'user-minh', username: 'minh.staff', password: 'Demo123', role: 2, status: 0 },
    ],
    news: [
      {
        id: 'news-welcome',
        title: 'A new semester, a fresh beginning',
        content:
          'Welcome back to campus! Explore student clubs, meet your lecturers and find your place in the university community. Orientation activities are open to all students.',
        categoryId: 'cat-campus',
        createdBy: 'user-admin',
        status: 1,
        tags: ['campus', 'students'],
        createdAt: '2026-09-25T08:00:00+07:00',
      },
      {
        id: 'news-research',
        title: 'Student research takes the next step',
        content:
          'Our students are turning classroom ideas into practical research. This semester, the research showcase brings together projects in software engineering, design and business.',
        categoryId: 'cat-academic',
        createdBy: 'user-linh',
        status: 1,
        tags: ['research'],
        createdAt: '2026-09-28T09:00:00+07:00',
      },
      {
        id: 'news-tech',
        title: 'Save the date: campus technology week',
        content:
          'Join a week of workshops, industry talks and collaborative activities. The programme will introduce students to new tools and career paths in technology.',
        categoryId: 'cat-events',
        createdBy: 'user-admin',
        status: 1,
        tags: ['technology', 'events'],
        createdAt: '2026-10-01T10:00:00+07:00',
      },
      {
        id: 'news-clubs',
        title: 'Find your community at the club fair',
        content:
          'From music to coding, campus clubs are ready to welcome new members. Visit the club fair to discover activities and connect with students who share your interests.',
        categoryId: 'cat-campus',
        createdBy: 'user-linh',
        status: 0,
        tags: ['clubs'],
        createdAt: '2026-10-03T14:00:00+07:00',
      },
    ],
    settings: { ...defaultSettings },
  };
}
