import Express from "express";
declare global { 
    type RequestHandler = Express.RequestHandler;
}