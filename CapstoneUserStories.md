## User Stories
1. As a teacher, I want a dashboard where I can record batch student attendance through a simple form, so that I can quickly log attendance.
<ul>
  <li>The system provides an affordance for record submission within the interface.</li>
  <li>Teachers can open a screen (/attendance) listing all students with: Name, Date, and Attendance.</li>
  <li>Teachers can select a date from a calendar input (date picker component).</li>
  <li>On form submission, a new attendance record should be added to the database for all selected students’ attendance histories.</li>
  <li>If an attendance record already exists for the specified student on a specified date, the system must detect the existing database entry and prompt the teacher with a confirmation message before performing an update.</li>
</ul>


2. As a teacher, I want a dashboard to filter and view attendance reports by student name, date, or status, so that I can analyze attendance patterns visually.
<ul>
  <li>Teachers can filter records by student name.</li>
  <li>Teachers can filter records by date.</li>
  <li>Teachers can filter records by attendance status.</li>
  <li>The system provides a dedicated reports section within the interface.</li>
  <li>Teachers should be able to look at the attendance of students in a dashboard of data.</li>
  <li>Teachers should be able to click a dropdown and click the checkboxes to choose what specific info they want to look at.</li>
  <li>Teachers should be able to select multiple filters at once.</li>
</ul>


3. As an Admin, I want a web interface to schedule days off so that I can manage attendance policies more efficiently. 
<ul>
  <li>The system provides a dedicated calendar section within the interface.</li>
  <li>Teachers can visit a Schedule Page (/schedule) where they can: Select a date, choose a reason, plan a day off that gets saved to the database.</li>
  <li>The system automatically applies EXCUSED absences for all students on that date.</li>
  <li>Planned days off are excluded from totals in student attendance reports.</li>
</ul>


4. As a teacher, I want a web interface to view automatic alerts for excessive absences or latenesses so that I can know which students require intervention.
<ul>
  <li>The system provides a view that shows a list of students who have crossed the alert threshold.</li>
  <li>The alerts in the dropdown can be manually cleared with a button.</li>
  <li>Teachers are able to set a threshold for an acceptable number of latenesses and absences per student.</li>
  <li>Teachers get an alert to notify parents when a student reaches a previously designated number of absences or latenesses in a 30-day span or cumulatively.</li>
</ul>


5. As a teacher, I want to add, edit, and remove student information (name, ID, grade*), so that I can maintain an accurate student roster for attendance tracking.
<ul>
  <li>Teachers should be able to add a profile for a new student.</li>
  <li>Teachers should be able to edit a student's name, grade, and ID, in their profile.</li>
  <li>Teachers should be able to delete a student profile.</li>
  <li>Student IDs must be unique within the system.</li>
  <li>Name and ID are required fields; grade is optional.</li>
</ul>


6. As a teacher, I want to add, edit, and remove class information (name, ID, grade*), so that I can manage a group of students within the same class.
<ul>
  <li>Teachers should be able to create a class for a group of students.</li>
  <li>Teachers should be able to add or remove students from a class without deleting their profiles.</li>
  <li>Teachers should be able to delete a class without deleting a student profile.</li>
  <li>Student IDs must be unique within the system.</li>
  <li>Name and ID are required fields; grade is optional.</li>
</ul>

