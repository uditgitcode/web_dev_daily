// data/students.js
// In-memory "database" using a plain JS array (no MongoDB/MySQL/Mongoose allowed)

let students = [
  { id: 1, name: "Rahul", course: "BCA", age: 20 },
  { id: 2, name: "Priya", course: "BTech", age: 21 },
  { id: 3, name: "Amit", course: "BCA", age: 19 },
];

// Keeps track of the next id to assign to a new student
let nextId = 4;

function getNextId() {
  return nextId++;
}

module.exports = {
  students,
  getNextId,
};
