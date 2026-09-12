import type { ContactDto, populatedContact } from "../Models";

export function toContactDTO(contact: populatedContact): ContactDto {
  return {
    id: contact._id.toString(),
    targetUserId: contact.userId._id.toString(),
    nickname: contact.nickname,
    user: !contact.userId.isDeleted
      ? {
          uid: contact.userId.uid,
          username: contact.userId.username,
        }
      : null,
    createdAt: contact.createdAt.toISOString(),
  };
}
