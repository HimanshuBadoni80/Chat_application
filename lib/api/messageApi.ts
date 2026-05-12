// import apiFetch from "../fetchapi/fetchWrapper";
// import type { updatedIConversation } from "../types/Conversation";
// function to fetch all the conversations.
// export const fetchConversations = async () => {
//   try {
//     return await apiFetch<updatedIConversation[]>(
//       "api/conversations/conversationList",
//     );

//     // create an array of conversations that react can render.
//     // the array is passed to react as a state as in useState.
//     // this function will render when the user lands on the dashboard first time or hit the refresh
//     // when a new conversation is creaeted by user the state gets updated.

//     // also this function populates the messages: Record<string, IMessageBase[]>;  in the sueChatStore so that each conversation have at least one message- the last message.
//   } catch (error) {

//   }
// };

// function to send new messages to backend api
export const sendMessage = async () => {


};

// function to fetch history
export const fetchHistory = async () => {

};
