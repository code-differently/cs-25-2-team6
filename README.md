# cs-25-2-team6
Main repo for Code Society 25.2 Cohort Team 6

Selected Problem: 
School attendance management system 

Timeline
Submit three user stories (Monday, 9/15, 5PM ET)
Receive approval for your user stories (Tuesday, 9/16, 1PM ET)
Finish code commits (Friday, 9/19, 1PM ET)
Give presentation (Monday, 9/22, 1PM ET)

Project Requirements w/ Group Notes:
All work must be submitted in your team's assigned GitHub repository.
The assignment can be completed in TypeScript or in Java.
TypeScript
## Must include at least 5 types of objects with meaningful relationships to each other.
Building
- Main Building
- Admin Building 
Attendance Record
- Is On Time
- Is Late
- Is Absent
    - Unexcused
    - Excused
Student 
- First name
- Last name
- Studentid


Staff
- Teaching Staff
- Building Staff
- Administrative Staff
Scheduled days off
- Student schedule
- Staff schedule

One of your objects must be a custom data structure that provides for adding, removing, and updating items in a collection.
Student
Implement at least two custom exceptions.
Exception 1: Has Scheduled Day Off
Exception 2: Student Not Found
Write unit tests achieving 90% code coverage ( Jest for Typescript). 
Must include an integration test for each user story that demonstrates how your code implements the desired feature.
Your solution must illustrate each of the SOLID principles.
Each team member must contribute at least one submitted pull request containing working code and tests.
Include a README for your repo describing the problem you're solving, the solution, and how you would improve your solution.
Design a CLI that allows users to interact with your application. Check out the code in lesson_10 for an example in TypeScript, or this file for an example in Java.

Problems to Address:
What problem were you attempting to solve?
In many small or underfunded schools, the process of tracking attendance is done on paper and manually entered into a spreadsheet, which increases the risk of inaccurate data. We want to create a more effective method of tracking who is coming and going in a school environment to make sure that the whereabouts of each student is properly tracked and to ensure appropriate staff coverage.
How does your design address the solution?
It provides the oversight needed to have accurate tracking of who is present in a school at a given time, from students to staff members. 
It provides a unified system that can be used by all teachers and staff, so the process of tracking attendance is standardized, reducing the likelihood of manual entry errors.
It makes the process of generating reports and reviewing attendance data more efficient because it provides the functionality to sort and filter through electronic records quickly.
How did you address each of the SOLID principles?
How would you improve on your solution?






## User Stories:
As a teacher, I want a way to track attendance so that I can maintain a digitally recorded log.
- Teachers should be able to input a student's first name, last name, attendance status and date.
- Teachers can select dates using a calendar-based date selector.
- Teachers can mark a checkbox to indicate whether a student was late or on time.
If a student does not have a box checked for a given day, they should be marked as absent. 

As a user, I want to manage attendance records from the CLI, so that I can review participation data without relying on a graphical interface.
- Users should be able to filter attendance reports by student last name, attendance status, or date. 
- Users can open a late list for any given date or individual.
- Users can open an early dismissal list for any given date or individual.

As a teacher, I want a way to save the attendance records, so that I can view historical data.
- Teachers can store students’ attendance in a digital log that they can view at any time.
- Teachers have the option to view attendance logs in a daily, weekly, or monthly view.
- Teachers get an alert to notify parents when a student reaches a previously designated number of absences or latenesses in a 30-day span or cumulatively.
- Teachers can request a YTD at a glance of any student’s attendance.

As a teacher, I want to input scheduled days off, so that students can be given an excused absence in the system.
- Planned days off are automatically marked as excused absences for all students.
- Weekends and planned days off are excluded from totals in student attendance reports.
- Planned days off will account for weekends, national holidays, professional development & report card conferences. (should be a.)

Presentation:
UML and actions diagrams to show how each class interacts with each other










