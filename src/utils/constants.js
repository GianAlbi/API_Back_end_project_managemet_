// Export an object that defines available user roles in the application as enumerative constants
// Using an object with hardcoded string values prevents typos and facilitates refactoring
export const UserRolesEnum = {
    ADMIN: "admin",  // Defines administrator role with full system privileges
    PROJECT_ADMIN: "project_admin",  // Defines project administrator role with privileges limited to specific projects
    MEMBER: "member"  // Defines base member role with minimal privileges limited to own resources
};

// Export an array containing all available user role values
// This array is useful for validations, frontend dropdowns and authorization checks
export const AvailableUserRole = Object.values(UserRolesEnum);  // Converts UserRolesEnum object to array ["admin", "project_admin", "member"]

// Export an object that defines possible task states in the application as enumerative constants
// Standardizing task states ensures data consistency and business logic consistency
export const TaskStatusEnum = {
    TODO: "todo",  // Defines "to do" state for tasks not yet started
    IN_PROGRESS: "in_progress",  // Defines "in progress" state for tasks currently being worked on
    DONE: "done"  // Defines "completed" state for tasks successfully finished
};

// Export an array containing all available task status values
// This array is useful for validations, filters and for populating selectors in the user interface
export const AvailableTaskStatues = Object.values(TaskStatusEnum);  // Converts TaskStatusEnum object to array ["todo", "in_progress", "done"]