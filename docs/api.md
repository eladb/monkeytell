## GET /groups/:address ##

Returns information about a group by address.


Note: in the future, we will not return all the metadata from this API because it is private, but in the meantime, we do.

## POST /groups/:address ##

Creates a group.

### Request ###

#### Headers ####

```
Content-Type: application/json
```

#### Body ####

```json
{
  owner: 'alias@domain.com',
  members: [
    'member1@domain.com',
    'member2@domain.com'
  ]
}
```

### Response ###

The following status codes may be returned:

 - 201 Created
 - 409 Conflict: already exists
 - 409 Code = InvalidArgument
 - 409 Code = MissingParameter

## DELETE /groups/:address ##

Deletes a group by address.