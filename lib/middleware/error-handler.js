'use strict';


//express knows four parameters is an error
module.exports=(err, req, res, next) =>{
  let error ={
    "text" : "Server Error",
    "error" : err
  }
  res.status(500).json(error);
}