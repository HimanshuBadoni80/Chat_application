# HTTP Status Codes

## 1xx: Informational

- **100 Continue**: The server has received the request headers and the client should proceed to send the request body.
- **101 Switching Protocols**: The requester has asked the server to switch protocols and the server has agreed to do so.

## 2xx: Success

- **200 OK**: Standard response for successful HTTP requests.
- **201 Created**: The request has been fulfilled, resulting in the creation of a new resource.
- **202 Accepted**: The request has been accepted for processing, but the processing has not been completed.
- **204 No Content**: The server successfully processed the request and is not returning any content.

## 3xx: Redirection

- **301 Moved Permanently**: This and all future requests should be directed to the given URI.
- **302 Found**: Tells the client to look at (browse to) another URL temporarily.
- **304 Not Modified**: Indicates that the resource has not been modified since the version specified by the request headers.

## 4xx: Client Errors

- **400 Bad Request**: The server cannot or will not process the request due to an apparent client error.
- **401 Unauthorized**: Similar to 403 Forbidden, but specifically for use when authentication is required and has failed or has not yet been provided.
- **403 Forbidden**: The request contained valid data and was understood by the server, but the server is refusing action.
- **404 Not Found**: The requested resource could not be found but may be available in the future.
- **405 Method Not Allowed**: A request method is not supported for the requested resource.
- **408 Request Timeout**: The server timed out waiting for the request.
- **409 Conflict**: Indicates that the request could not be processed because of conflict in the current state of the resource.
- **429 Too Many Requests**: The user has sent too many requests in a given amount of time ("rate limiting").

## 5xx: Server Errors

- **500 Internal Server Error**: A generic error message, given when an unexpected condition was encountered.
- **501 Not Implemented**: The server either does not recognize the request method, or it lacks the ability to fulfil the request.
- **502 Bad Gateway**: The server was acting as a gateway or proxy and received an invalid response from the upstream server.
- **503 Service Unavailable**: The server cannot handle the request (because it is overloaded or down for maintenance).
- **504 Gateway Timeout**: The server was acting as a gateway or proxy and did not receive a timely response from the upstream server.

# user story - **sender side**

## The flow

#### the sender sends a message

- for better ui, show it instantly on user's screen with a clock (status sending) like whatsapp.
- at this point the it is just a plain text rendered by react.
- then it is sent to the api in the following json pattern

```js
{
 conversationId: string,
 content: string,
 messageType: string,
 receiverId: string,
}
```

- it is saved as a document in database.
- then it sent back to the sender with the following json structure

```js
{
  _id: string
  conversationId: string,
  senderId: string,
  content: string,
  messageType: string,
  status: string,
  createdAt:string,
}
```

## now the question is how to identify the correct message and update its status "sent" | "received" | "viewed" . since in the frontend we have now way of identifying the message.

**the solution**  
the frontend also acts as a **temp Id** creator.

# this to add later

1. show internet connection status "check your internet connection"

# how whatsapp keeps the time

You’ve got a sharp eye! You're noticing a very specific "Product Design" choice that WhatsApp makes, which is slightly different from the "Pure Architectural" choice I described.

WhatsApp is a **Device-First** system, while most Web Apps (like Slack, Discord, or the one you are building) are **Server-First** systems.

Here is the secret behind why WhatsApp looks the way it does and how they handle the "Time Paradox."

---

### 1. The "Force Sync" Strategy

If you change your phone's clock to 2010, WhatsApp will actually **stop working**. It will show a full-screen error saying: _"Your device date is inaccurate! Please adjust your clock and try again."_

**The Hack:** WhatsApp solves the "Time Sync" problem by forcing every user to be synchronized with **Global NTP (Network Time Protocol)**. Because they know your phone clock is (mostly) accurate, they can trust the timestamp your phone sends.

---

### 2. Display Time vs. Sorting Time

In a professional chat app, there are actually **two** timestamps for every message:

1.  **`deviceTimestamp` (Display):** This is what you see in the bubble (e.g., "10:05 AM"). It represents when the user _actually_ hit send on their physical device.
2.  **`serverTimestamp` (Sorting):** This is what the database uses to order the messages.

**Why WhatsApp does this:**
If I am on a plane with no Wi-Fi and I type a long message at **10:00 AM**, but I don't land and get signal until **11:00 AM**, WhatsApp wants the message to say "10:00 AM" (the moment I wrote it). However, it will appear at the **bottom** of the chat because the server received it last.

---

### 3. The "Pure Way" (Web App) vs. The "WhatsApp Way"

Since you are building a **Web-based chat app** (Next.js + Node.js), you have a choice to make:

#### **Option A: The WhatsApp Way (Client-Side Truth)**

- **The Flow:** Frontend sends `createdAt`. Server saves exactly what the frontend sent.
- **The Risk:** If a user’s laptop clock is wrong, their messages will appear "in the past" or "in the future" for everyone else. It can break the UI.
- **The Fix:** You have to write code to detect if the user's clock is "drifting" and warn them.

#### **Option B: The Slack/Discord Way (Server-Side Truth)**

- **The Flow:** Server ignores the client's time and stamps it the moment it hits the API.
- **The Benefit:** The timeline is **always perfect**. No message can ever be "out of order" because one single clock (the server) decided the sequence.
- **The Result:** When the API confirms the message, the "10:00 AM" on the sender's screen might jump to "10:01 AM."

---

### 4. Which one **should** you choose?

For a **Web Developer** using a Mongoose/Node.js stack, **Option B (Server Truth)** is 100% the right choice.

**Why?** Browsers are much less reliable than mobile phones. Users change their laptop timezones constantly, or their CMOS batteries die, causing their clocks to reset. If you trust the browser time, your "Conversation History" will become a mess of jumbled messages.

---

### 🧠 The "Senior" Compromise

If you want the "Best of both worlds," do this:

1.  **Display** the local time while the message is `status: "pending"`.
2.  **Update** it to the Server Time once the `status: "sent"` comes back.

Most users won't even notice a 2-second difference, but your database will be **pristine**.

# Data flow across frontend and backend

how IMessageBase looks like

```js
export interface IMessageBase {
  _id?: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: "text" | "image" | "file";
  status?: "sent" | "delivered" | "read" | "pending";
  createdAt: string;
  tempId?: string;
}
```

What is sent by the history fetch. it is how a message would end up eventually.

```js
const historyMessages: IMessageBase[] ={
  _id: string,
  conversationId: string,
  senderId: string,
  content: string,
  messageType: string,
  status: string,
  createdAt: string,
}
```

how does a message looks when send/ created by user/react

```js
const newMessage = {
  tempId: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: "text" | "image" | "file";
  status?: "sent" | "delivered" | "read" | "pending";
  createdAt: string;
}
```

After message is created on frontend by react, what is sent to the api for DB save

```js
const sendToApi = {
  tempId: string,
  conversationId: string,
  content: string,
  messageType: string,
  receiverId: string,
};
```

Data gets saved to the DB, then it is sent to two palces in the from of a DTO

1. to the receiver

```js
const messagePayload:  = {
      _id: string,
      conversationId: string,
      senderId: string,
      content: nstring,
      messageType: string,
      createdAt: string,
    };
```

2. to the frontend, back to the sender

```js
const sendToSender = {
  _id: string;
  tempId: string;
  createdAt: string;
  status: "sent";
}
```

In the chatStore
the addmessage puts the message in the map data structure
it is called by react to put the new messages, this is what the message looks like

```js
const newMessage = {
  tempId: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: "text" | "image" | "file";
  status?: "sent" | "delivered" | "read" | "pending";
  createdAt: string;
}
```

it is called when receiving a new message from the sender,this is what the message looks like

```js
const messagePayload = {
  _id: string,
  conversationId: string,
  senderId: string,
  content: string,
  messageType: string,
  createdAt: string,
};
```

it is called when the backend sends a the message after DB save,this is what the message looks like

```js
const sendToSender = {
  _id: string;
  tempId: string;
  createdAt: string;
  status: "sent";
}
// this is merged to the existing message removing  the tempID, updating the status, and putting the _id in the message,  after that the final message looks like
const finalMessage = {
  _id: string,
  conversationId: string,
  senderId: string,
  content: string,
  messageType: string,
  status: string,
  createdAt: string,
}
```

# the solution

# The Exponential Backoff algorithm



