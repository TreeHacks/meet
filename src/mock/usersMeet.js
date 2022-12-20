const occupations = [
  "engineer",
  "artist",
  "designer",
  "business student",
];
const interests = ["music", "art", "design", "business"];
const firstNames = ["John", "Jane", "Bob", "Alice"];

const getRandom = (arr) =>
  arr[Math.floor(Math.random() * arr.length)];

const getMeetInfo = () => ({
  showProfile: Math.random() > 0.15,
  profileDesc: `I am a ${getRandom(occupations)}`,
  verticals: [getRandom(interests), getRandom(interests)],
  first_name: getRandom(firstNames),
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
