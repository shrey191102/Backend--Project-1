const asyncHandler=(requestHandler)=>{
    return (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next))
       .catch((err) => next(err))
    }
}

export {asyncHandler}


// second method
/* 
const asyncHandler=(fn) => {()=>{}}
just removed {} in above line to get this lines below
const asyncHandler = (fn)=>async (req, res, next) =>{
    try{
        await fn(req, res, next)
    }catch(err){
        res.status(err.code ||500).json({
        message: err.message,
        success: false
        })
    }
 }
*/