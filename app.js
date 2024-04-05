const mysql = require("mysql2");
const express = require("express");
const cors = require("cors");
require('dotenv').config(); 

const app = express();
const port = 3000;

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cors()); 

const mysqlConnection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

gitignore
app.use(express.json());

mysqlConnection.connect((err) => {
  if (err) {
    console.log("Error connecting database", err);
  } else {
    console.log("MYSQL Database Connected Successfully.");
  }
});

app.get("/install", (req, res) => {
  const sudentQuery = `CREATE TABLE IF NOT EXISTS student (
    student_id INT Auto_INCREMENT,
    student_name VARCHAR(255) NOT NULL,
    student_age INT(11) not null,
    student_gender varchar(255) NOT NULL,
    student_grade INT NOT NULL, 
    PRIMARY KEY (student_id)
)`;

  const courseQuery = `CREATE TABLE IF NOT EXISTS course (
    course_id INT AUTO_INCREMENT,
    course_name VARCHAR(255) NOT NULL,
    credit_hours INT(11) NOT NULL, 
    student_id INT NOT NULL,
    PRIMARY KEY (course_id),
    FOREIGN KEY (student_id) REFERENCES student(student_id)
)`;

  const instructorQuery = `CREATE TABLE IF NOT EXISTS instructor (
    instructor_id INT AUTO_INCREMENT,
    instructor_name varchar(255) NOT NULL, 
    total_credit_hours INT(11) NOT NULL,
    student_id INT NOT NULL,
    PRIMARY KEY (instructor_id),
    FOREIGN KEY (student_id) REFERENCES student (student_id)
)`;

  mysqlConnection.query(sudentQuery, (err, req, res) => {
    if (err) {
      console.log("Error Creating Student Table:", err);
      res.status(500).send("Error Creating Student Table");
    } else {
      console.log("Student Table Created Successfully. ");
      //    res.status(200).send("Table Created successfully. ");
    }
  });

  mysqlConnection.query(courseQuery, (err) => {
    if (err) {
      console.log("Error Creating Course Table", err);
      res.status(500).send("Error Creating Course Table");
    } else {
      console.log("Course Table Created Successfully");
      res.status(200).send("Table Created successfully");
    }
  });

  mysqlConnection.query(instructorQuery, (err, res, req) => {
    if (err) {
      console.log("Error Creating Instructoe Table", err);
      res.status(500).send("Error Creating Course Table");
    } else {
      console.log("Instructor Table Created Successfully");
      //   res.status(200).send("Table Created successfully");
    }
  });
});

app.post("/student-info", (req, res) => {
  console.table(req.body);

  const { student_name, student_age, student_gender, student_grade } =
    req.body.student;

  let insertStudentQuery = `INSERT INTO student (student_name, student_age, student_gender, student_grade) 
    VALUES (?, ?, ?, ?)`;

  mysqlConnection.query(
    insertStudentQuery,
    [student_name, student_age, student_gender, student_grade],
    (err, studentResults, fields) => {
      if (err) {
        console.error("Error Inserting Student data:", err);
        res.status(500).send("Error Inserting Student data");
      } else {
        console.log(
          "Student Data Inserted successfully.",
          studentResults.insertId
        );
      }

      //   console.log("Query results:", studentResults);
      //   console.log("Query fields:", fields);

      const { course_name, credit_hours } = req.body.course;

      let insertCourseQuery = `INSERT INTO course (course_name, credit_hours, student_id) 
        VALUES (?, ?, ?)`;

      mysqlConnection.query(
        insertCourseQuery,
        [course_name, credit_hours, studentResults.insertId],
        (err, courseResults, filds) => {
          if (err) {
            console.log("Error Inserting Course data", err);
            res.status(500).send("Error Inserting Course data");
          } else {
            console.log(
              "Course Data Inserted successfully.",
              courseResults.insertId
            );
          }
          const { instructor_name, total_credit_hours } = req.body.instructor;

          let insertInstructorQuery = `INSERT INTO instructor (instructor_name, total_credit_hours, student_id) 
              VALUES (?, ?, ?)`;

          mysqlConnection.query(
            insertInstructorQuery,
            [instructor_name, total_credit_hours, studentResults.insertId],
            (err, instructorResults, filds) => {
              if (err) {
                console.log("Error Inserting Instructor data", err);
                res.status(500).send("Error Inserting Instructor data");
              } else {
                console.log(
                  "Instructor Data Inserted successfully.",
                  instructorResults.insertId
                );
                res.status(200).send("Data Inserted Successfully");
              }
            }
          );
        }
      );
    }
  );
});

app.get("/department-info", (req, res) => {
  mysqlConnection.query(
    `SELECT *
   FROM student
   JOIN course JOIN instructor ON student.student_id = course.student_id 
   AND student.student_id = instructor.student_id`,
    (err, results, filds) => {
      if (err) {
        console.log("Data Selection Error", err);
        res.status(500).send("Internal Server Error");
      } else {
        console.log("Query Results: ", results);
        res.send(results);
      }
    }
  );
});

app.get("/student", (req, res) => {
  mysqlConnection.query(
    `
  SELECT student.student_id AS id,
         student.student_name,
         course.course_name,
         instructor.instructor_name
  FROM student 
  JOIN course ON student.student_id = course.student_id
  JOIN instructor ON student.student_id = instructor.student_id`,

    (err, results, filds) => {
      if (err) {
        console.log("Error fiching Data", err);
        res.status(500).send("Error fetching Data");
      } else {
        res.send(results);
        console.log("Data fetched successfully"); 
      }
    }
  );
});

app.listen(port, () => {
  console.log("Server Listening on port " + port);
});
