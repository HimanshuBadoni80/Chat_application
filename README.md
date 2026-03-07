# HTTP Status Codes

## 1xx: Informational
*   **100 Continue**: The server has received the request headers and the client should proceed to send the request body.
*   **101 Switching Protocols**: The requester has asked the server to switch protocols and the server has agreed to do so.

## 2xx: Success
*   **200 OK**: Standard response for successful HTTP requests.
*   **201 Created**: The request has been fulfilled, resulting in the creation of a new resource.
*   **202 Accepted**: The request has been accepted for processing, but the processing has not been completed.
*   **204 No Content**: The server successfully processed the request and is not returning any content.

## 3xx: Redirection
*   **301 Moved Permanently**: This and all future requests should be directed to the given URI.
*   **302 Found**: Tells the client to look at (browse to) another URL temporarily.
*   **304 Not Modified**: Indicates that the resource has not been modified since the version specified by the request headers.

## 4xx: Client Errors
*   **400 Bad Request**: The server cannot or will not process the request due to an apparent client error.
*   **401 Unauthorized**: Similar to 403 Forbidden, but specifically for use when authentication is required and has failed or has not yet been provided.
*   **403 Forbidden**: The request contained valid data and was understood by the server, but the server is refusing action.
*   **404 Not Found**: The requested resource could not be found but may be available in the future.
*   **405 Method Not Allowed**: A request method is not supported for the requested resource.
*   **408 Request Timeout**: The server timed out waiting for the request.
*   **409 Conflict**: Indicates that the request could not be processed because of conflict in the current state of the resource.
*   **429 Too Many Requests**: The user has sent too many requests in a given amount of time ("rate limiting").

## 5xx: Server Errors
*   **500 Internal Server Error**: A generic error message, given when an unexpected condition was encountered.
*   **501 Not Implemented**: The server either does not recognize the request method, or it lacks the ability to fulfil the request.
*   **502 Bad Gateway**: The server was acting as a gateway or proxy and received an invalid response from the upstream server.
*   **503 Service Unavailable**: The server cannot handle the request (because it is overloaded or down for maintenance).
*   **504 Gateway Timeout**: The server was acting as a gateway or proxy and did not receive a timely response from the upstream server.