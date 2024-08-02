
const asyncHandler = (requestHandler) => {
    return (req,res,next)=>{
        Promise .resolve(requestHandler(req, res, next)) .catch((err) => next(err))
    }
}


export {asyncHandler}




















//to handle async functions

//ek function le rhe hai aur usi ko modify krke return kr rhe hain:

// const asyncHandler= (fn)=> async(req,res,next) => {
//     try{
//         await fn(req,res,next);
//     }catch(error){
//         res.status(err.code||500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }