# Intro
This is a prototype of a simple data pipeline for:
* receiving user's geo-location updates to keep track their traveling routes.
* calculating total traveled distances for analytic purpose.

# High-level design
I'm looking for a server-less solution for building up the solution, so that I can minimize DevOps efforts such as 
maintaining the hosts and network infrastructures. Meanwhile, it could be ideal if I can build and test each component
on my local machine so that I don't need to pay for the cloud service. 

I've tried with using AWS + LocalStack but sadly
there is a glitch in CloudFormation support in the LocalStack, which will make my deployment process more complicated. 

Finally, I decided to use Firebase to build my solution:

![Test Image 1](/demo-firebase.png)


# Components
## Location update function
A cloud function with http trigger, aims to handle end-user location update requests:

Example request:
* /updateLocation (POST)
    * uid
    * timestamp
    * latitude
    * longitude
    
Upon receiving a request, the function will extract the payload from request body. Then convert it to a document with 
partition key = timestamp, and write it to Firestore DB.

## Firestore DB
Document-based NoSQL database which are used to store each location update per user's request. User's traveling routes
can be retrieved from here if appropriate indexes is provides.

## on Location Update DB Trigger
A cloud function with Firestore trigger, aims to either create or update total distances traveled per user.
Caveat: should add timestamp check for lasted modification time to avoid currency issue.

## Cloud Database
Key-value based database in which we store total traveled distance per user.

# Deployment
Currently, everything run on emulators locally. 
```
firebase emulators:start
```
Deployment to google cloud should be as easy as: (I didn't test it since it asked me to provide billing information)
```
firebase deploy
```
Even more, for future CI/CD, this can integrate with firebase-ci, so we can staging and production environments.



