import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import {
  TextField,
  Button,
  Select,
  InputLabel,
  MenuItem,
  Typography,
} from "@material-ui/core";

import { editTicket, expandTicket } from "../actions";
import { axiosWithAuth } from "../utils/axiosWithAuth";

import ContentPlaceholder from "./ContentPlaceholder";

export default function TicketExpanded() {
  const dispatch = useDispatch();
  const {
    register,
    control,
    handleSubmit,
    triggerValidation,
    errors,
  } = useForm();
  const user = useSelector((state) => state.user);
  const ticketId = useSelector((state) => state.expandedTicketId);
  const [isEditing, setIsEditing] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (ticketId) {
      axiosWithAuth()
        .get(`/api/tickets/${ticketId}`)
        .then((res) => setTicket(res.data))
        .catch((err) => console.log(err));
      axiosWithAuth()
        .get(`/api/tickets/${ticketId}/comments`)
        .then((res) => setComments(res.data));
    }
  }, [ticketId]);

  const onSubmitEdit = (data) => {
    axiosWithAuth()
      .put(`/api/tickets/${ticket.ticket_id}`, data)
      .then((res) => {
        dispatch(expandTicket(null));
        dispatch(editTicket(res.data));
      })
      .catch((err) => console.log(err.response.data.message));
  };

  const submitComment = (data) => {
    const comment = {
      author: user.user_id,
      message: data.message,
      ticket_id: ticket.ticket_id,
    };

    axiosWithAuth()
      .post("/api/comments", comment)
      .then((res) => {
        setComments([...comments, res.data]);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div>
      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmitEdit)}>
          <TextField
            id="title"
            name="title"
            variant="outlined"
            className="form-item"
            inputRef={register}
            defaultValue={ticket.title}
          />
          <TextField
            id="content"
            name="content"
            variant="outlined"
            className="form-item"
            multiline
            rows={4}
            inputRef={register}
            defaultValue={ticket.content}
          />
          <InputLabel id="category">Category</InputLabel>
          <Controller
            as={Select}
            control={control}
            name="category_id"
            labelId="category"
            defaultValue={1}
            className="form-item"
          >
            <MenuItem value={1}>Technical Support</MenuItem>
            <MenuItem value={2}>Leave of Absence</MenuItem>
            <MenuItem value={3}>Student Support</MenuItem>
          </Controller>
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
        </form>
      ) : (
        <>
          {ticket ? <h1>{ticket.title}</h1> : <ContentPlaceholder height="1" />}
          {ticket ? <p>{ticket.date}</p> : <ContentPlaceholder height="1" />}
          {ticket ? <p>{ticket.author}</p> : <ContentPlaceholder height="1" />}
          {ticket ? (
            <p>{ticket.category}</p>
          ) : (
            <ContentPlaceholder height="1" />
          )}
          {ticket ? <p>{ticket.content}</p> : <ContentPlaceholder height="4" />}
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsEditing(!isEditing)}
          >
            Edit
          </Button>
        </>
      )}
      {comments &&
        comments.map((comment) => {
          return (
            <Typography>{`${comment.author}: ${comment.message}`}</Typography>
          );
        })}
      <form onSubmit={handleSubmit(submitComment)}>
        <TextField
          name="message"
          label="Message"
          variant="outlined"
          style={{ width: "100%" }}
          inputRef={register}
        />
      </form>
    </div>
  );
}
