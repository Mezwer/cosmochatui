import { useState, useEffect } from 'react';
import React from 'react';
import OpenAI from "openai";
import { Button, Grid } from '@mui/material';
import Textarea from '@mui/joy/Textarea';
import api from "../../api/sessions";
import { useParams } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";

import Images from "../../constants/images";
import ChatStyles from "../../styles/chat";
import UserMessage from "../../components/UserMessage";
import RexMessage from "../../components/RexMessage";

const Chat = () => {
    const { id } = useParams();
    const [userPrompt, setUserPrompt] = useState("");
    const [sessions, setSessions] = useState([]);
    const [thisSessions, setThisSessions] = useState({});

    let rexReply = "";

    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sept",
        "Oct",
        "Nov",
        "Dec",
    ];

    const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
    const openai = new OpenAI({ apiKey: API_KEY, dangerouslyAllowBrowser: true });
    const matches = useMediaQuery("(min-width:600px)");
    let chatKeys = [];

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await api.get("/sessions");
                setSessions(response.data);
                setThisSessions(
                    response.data.find(
                        (sessions) => parseInt(sessions?.id, 10) === parseInt(id, 10)
                    )
                );
                handleScroll();
                window.addEventListener("scroll", handleScroll);
            } catch (error) {
                if (error.response) {
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                } else {
                    console.log(error);
                }
            }
            return () => {
                window.removeEventListener("scroll", handleScroll);
            };
        };
        fetchSessions();
    }, [id]);

    const handleScroll = () => {
        const scrollPosition = window.scrollY;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let updatedSession = {};

        setTimeout(async function() {
            const date = new Date();
            const month = date.getMonth();
            const day = date.getDay();
            const year = date.getFullYear();
            const formattedDate = months[month] + " " + day + "." + year;
            await callOpenAIAPI();

            thisSessions.chats.push({
                user: userPrompt,
                Rex: rexReply
            });

            updatedSession = {
                id: id,
                date: formattedDate,
                chats: thisSessions.chats,
                isSessionEnded: thisSessions.isSessionEnded
            }

            for (let i = 0; i < updatedSession.chats.length; i++) {
                chatKeys.push(Object.keys(updatedSession.chats[i]));
            }

            try {
                const response = await api.put(`sessions/${id}`, updatedSession);
                setSessions(
                    sessions.map((session) => 
                        sessions.id === id ? response.data : session
                    )
                );
                setUserPrompt();
            } catch (error) {
                console.log(`Error: ${error.message}`);
            }
        }, 1000);
    };

    async function callOpenAIAPI() {
        const completion = await openai.chat.completions.create({
            messages: [{
                role: "system",
                content: userPrompt
            }],
            model: "gpt-3.5-turbo",
            max_tokens: 100
        });
        rexReply = completion.choices[0].message.content;
    }

    return (
        <Grid container style={{ display: matches ? "block" : "none" }}>
            <Grid style={{ padding: "40px 24px 24px 24px", positions: "sticky" }}>
                <img src={Images.HomRex} alt="Rex" style={{ width: "105px" }} />
            </Grid>
            <Grid {...ChatStyles.textDisplayBackground}>
                {thisSessions?.chats?.map((chat, i) =>
                    Object.keys(chat).map((key) => key === "Rex" ? (
                        <RexMessage rexMessage = {chat.Rex} key = {"rex" + i} />
                    ):(
                        <UserMessage userMessage = {chat.user} />
                    ))
                )}
            </Grid>
            {thisSessions && !thisSessions.isSessionEnded ? (
                <Grid>
                    <Textarea 
                        {...ChatStyles.textArea} 
                        name = "Soft"    
                        placeholder ="Type something here..."
                        variant ="soft"
                        onChange ={(e) => setUserPrompt(e.target.value)}      
                    />
                    <Button onClick={handleSubmit}>Send</Button>
                </Grid>
            ): null}
        </Grid>
    );
}

export default Chat;