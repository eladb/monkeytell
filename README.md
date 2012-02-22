### GET /groups/groupname ###

If unauthenticated (we don't have authentication), only an HTTP status will be returned.

 * 200 OK: The group exists
 * 404 NOT FOUND: The group does not exist

POST /groups/groupname

Accept: application/json
Body: {
    display_name: String, // group display name
    description: String,  // group description
    members: [
        Email,
        Email,
        ... // group members in email format (can contain display name)
    ]
}

 * 201 Created: group created successfully
 * 409 Conflict: group already exists

