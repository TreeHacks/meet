const occupations = [
  "engineer",
  "artist",
  "designer",
  "business student",
];
const interests = ["Healthcare", "Privacy and Safety"];
const firstNames = ["John", "Jane", "Bob", "Alice"];
const lastNames = ["Doe", "Robertson", "King", "Price"];
const skills = ["AI", "Data Mining", "NLP", "Web Development", "IOS", "Android", "Pitching", "Marketing", "Design", "AR/VR", "Game Development", "Systems"];
const commitment = ["High", "Medium", "Low"];

const getRandom = (arr) =>
  arr[Math.floor(Math.random() * arr.length)];

const randomSet = (arr, maxSize) => [...new Array(Math.floor(Math.random() * maxSize))].map(() => getRandom(arr));

const getMeetInfo = () => ({
  showProfile: Math.random() > 0.10,
  profileDesc: `I am a ${getRandom(occupations)}`,
  verticals: randomSet(interests, 3),
  first_name: getRandom(firstNames),
  last_name: getRandom(lastNames),
  isMentor: Math.random() > 0.75,
  linkedinLink: "https://www.linkedin.com/in/williamhgates/",
  devpostLink: "https://devpost.com/",
  githubLink: "https://github.com/",
  timezoneOffset: "GMT -0500",
  skills: randomSet(skills, 5),
  commitment: getRandom(commitment),
  idea: "No idea yet",
  pronouns: "they/them",
  profilePicture:
    "https://upload.wikimedia.org/wikipedia/en/d/d7/Random_person_image.png",
});

export const getUserMeetMock = () => {
  let res = [];
  for (let i = 0; i < 100; i++) {
    res.push({
      forms: {
        meet_info: getMeetInfo(),
      },
      user: {
        id: Math.floor(Math.random() * 10000),
      },
    });
  }

  return { results: res, count: res.length };
};
