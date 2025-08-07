# Reqline Parser

A simple parser for a curl-like tool called reqline that parses HTTP request statements and executes them.

## Syntax

```
HTTP [method] | URL [URL value] | HEADERS [header json value] | QUERY [query value json] | BODY [body value json]
```

## Examples

### Basic GET request
```
HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY {"refid": 1920933}
```

### GET request with headers
```
HTTP GET | URL https://dummyjson.com/quotes/3 | HEADERS {"Content-Type": "application/json"} | QUERY {"refid": 1920933}
```

### POST request with body
```
HTTP POST | URL https://dummyjson.com/products/add | BODY {"title": "Test Product", "price": 99.99}
```

### Complex request with all components
```
HTTP POST | URL https://dummyjson.com/products/add | HEADERS {"Content-Type": "application/json", "Authorization": "Bearer token123"} | QUERY {"category": "electronics"} | BODY {"title": "Test Product", "price": 99.99}
```

## Syntax Rules

- All keywords are UPPERCASE: HTTP, HEADERS, QUERY, BODY
- Single delimiter: pipe `|`
- Exactly one space on each side of keywords and delimiters
- HTTP methods: GET or POST only (uppercase)
- HTTP and URL are required and fixed order
- Other keywords (HEADERS, QUERY, BODY) can appear in any order or be omitted

## API Usage

### Endpoint
`POST /`

### Request Format
```json
{
  "reqline": "HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY {\"refid\": 1920933}"
}
```

### Success Response Format
```json
{
  "request": {
    "query": {"refid": 1920933},
    "body": {},
    "headers": {},
    "full_url": "https://dummyjson.com/quotes/3?refid=1920933"
  },
  "response": {
    "http_status": 200,
    "duration": 347,
    "request_start_timestamp": 1691234567890,
    "request_stop_timestamp": 1691234568237,
    "response_data": {
      "id": 3,
      "quote": "Thinking is the capital, Enterprise is the way, Hard Work is the solution.",
      "author": "Abdul Kalam"
    }
  }
}
```

### Error Response Format
```json
{
  "error": true,
  "message": "Specific reason for the error"
}
```

## Error Messages

- "Missing required HTTP keyword"
- "Missing required URL keyword"
- "Invalid HTTP method. Only GET and POST are supported"
- "HTTP method must be uppercase"
- "Invalid spacing around pipe delimiter"
- "Invalid JSON format in HEADERS section"
- "Invalid JSON format in QUERY section"
- "Invalid JSON format in BODY section"
- "Keywords must be uppercase"
- "Missing space after keyword"
- "Multiple spaces found where single space expected"

## Test Endpoint

`GET /test` - Returns test cases and usage examples

## Implementation Details

- Built without using regex as required
- Uses string splitting and parsing
- Implements all syntax validation rules
- Handles JSON parsing errors gracefully
- Uses axios for HTTP requests
- Includes timing information in responses
- Supports all required HTTP methods (GET, POST)
- Handles query parameter building automatically 