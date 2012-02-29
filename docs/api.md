# listzz api

## GET /groups/:address ##

Returns information about a group by address. In the future, we will not return all the metadata from this API because it is private, but in the meantime, we do.

## POST /groups/:address ##

Headers:

```
Content-Type: application/json
```

Body:

```json
{
  members: [
    'member1@domain.com',
    'member2@domain.com'
  ]
}
```

If the group already exists, an error will be returned.
