import Joi from "joi";
import { IPost, IComment } from "../types/post";

export const validatePostCreateData = async (data: IPost) => {
  const Schema = Joi.object<IPost>({
    body: Joi.string().min(2).max(300).required(),
    media: Joi.array().items(Joi.string()),
    communityID: Joi.string().min(24).max(24),
    comments: Joi.array().items(
      Joi.object<IComment>({
        text: Joi.string().required(),
        postID: Joi.string().max(24)
      })
    )
  });
  return Schema.validate(data);
};

export const validatePostEditData = async (data: IPost) => {
  const Schema = Joi.object<IPost>({
    body: Joi.string().min(2).max(300).required()
  });
  return Schema.validate(data);
};
