//Only admin can use this route
const express=require('express');
const router=express.Router();
const User=require('./../models/user');
const {jwtAuthMiddleware}=require('./../auth/jwt')
const Candidate=require('./../models/candidate');

//function to check if user is admin or not
const checkAdminRole=async (userId)=>{
    try{
        const user=await User.findById(userId);
        if(user.role=='admin'){
            return true;
        }
    }catch(err){
        return false;
    }
}

//post route to add a candidate
router.post('/',jwtAuthMiddleware,async (req,res)=>{
    try{
        if(! await checkAdminRole(req.user.id)){//when the user is not admin so no access
            return res.status(403).json({message:"User does not have admin role"});
        }
        const data=req.body;//Assuming that the request body contains the candidate data

        //Create a new candidate document using the mongoose model
        const newCandidate=new Candidate(data);

        //save the new candidate to the database
        const response=await newCandidate.save();
        console.log("candidate data saved");

        res.status(200).json({response:response});
    }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal server error'})
    }
})

//route to update the candidate's data
router.put(':candidateID',jwtAuthMiddleware,async(req,res)=>{
    try{
        if(! await checkAdminRole(req.user.id)){
            return res.status(403).json({message:"user does not have admin role"})
        }

        const candidateID=req.params.candidateID;//Extract the candidate id from the url parameter
        const UpdatedCandidateData=req.body;//Updated data for the candidate

        const response=await Candidate.findByIdAndUpdate(candidateID,UpdatedCandidateData,{
            new:true,//Return the updated document
            runValidators:true//run mogoose validation
        })

        if(!response){
            return res.status(404).json({message:"Candidate not found"});
        }

        console.log("candidate data updated");
        res.status(200).json(response);
    }catch(err){
        console.log(err)
        res.status(500).json({error:"Internal server error"});
    }
})

//route to delete candidate's data(only admin can use this route)
router.delete(':candidateID',jwtAuthMiddleware,async(req,res)=>{
    try{
        if(! await checkAdminRole(userId)){
            return res.status(403).json({message:"User does not have admin role"})
        }

        const candidateID=req.params.candidateID;//Extract the id from the URL parameter

        const response=await Candidate.findbyIdAndDelete(candidateID);

        if(!response){
            return res.status(404).json({message:"Candidate not found"})
        }

        console.log("Candidate deleted");
        res.status(200).json(response);

    }catch(err){
        console.log(err);
        res.status(500).json({error:"Internal server error"})
    }
})


//Lets start voting
router.post('vote/:candidateID',jwtAuthMiddleware,async (req,res)=>{
    //No admin can vote
    //user(voter) can vote only once

    candidateID=req.params.candidateID;
    userId=req.user.id;
    try{
        //find the candidate document with the specified candidateID [to vote]
        const candidate=await Candidate.findById(candidateID);
        if(!candidate){
            return res.status(404).json({message:"candidate not found"});
        }

        const user=await User.findById(userId);
        if(!user){
            return res.status(404).json({message:"user not found"})
        }

        if(user.isVoted){//isVoted is true means the user have already voted
            res.status(404).json({message:'You have already voted'})
        }

        if(user.role==admin){
            res.status(403).json({message:'Admin is not allowed to vote'})
        }

        //update the candidate document to record the vote
        candidate.votes.push({user:userId})
        candidate.voteCount++;
        await candidate.save();

        //Update the user document
        user.isVoted=true;
        await user.save();

        res.status(200).json({message:'Vote recorded successfully'});
    }catch{
        console.log(err)
        res.status(500).json({error:'Internal server error'})
    }
})

//vote count(for each party and must be in shorted order)
router.get('vote/count',async (req,res)=>{
    try{
        //find all candidates and sort them by voteCount in descending order
        const candidate=await Candidate.find().sort({voteCount:'desc'});

        //Map the candidates to only return their name and voteCount
        const voteRecord=candidate.map((data)=>{
            return{
                party:data.party,
                count:data.count
            }
        });
        return res.status(200).json(voteRecord);

    }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal server error'})
    }
})


// Get List of all candidates with only name and party fields
router.get('/', async (req, res) => {
    try {
        // Find all candidates and select only the name and party fields, excluding _id
        const candidates = await Candidate.find({}, 'name party -_id');

        // Return the list of candidates
        res.status(200).json(candidates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports=router;