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

![Test Image 1](https://viewer.diagrams.net/?highlight=0000ff&edit=_blank&layers=1&nav=1&title=Untitled%20Diagram.drawio#R7VjbcpswEP0aP8bD1XEeaztpOpPOZJLMpO1LR4Y1qBVaKpYE8vWVQBgcmktncnuwX9AerZZldXQWPPGXWfVZsTz9ijGIiefE1cRfTTzPc2YzfTFI3SKHgQUSxeMWcnvgkt%2BBBR2LljyGYseREAXxfBeMUEqIaAdjSuHtrtsGxe5dc5bACLiMmBij1zymtEXnodPjp8CTtLuz69iZjHXOFihSFuPtAPKPJ%2F5SIVI7yqolCFO8ri7tupMHZreJKZD0nAWXc%2FVDsXh1d12fnsXJ%2BspTFweub5OjuntiiHUBrImKUkxQMnHcowuFpYzBhHW01fucIeYadDX4C4hqu5usJNRQSpmws1Bx%2BmaWT%2BdeaO3vjd1Zq8pGb4x6YJyD4hkQqA6TpOo2mHsYdsAgmjH7cI1VD637AduCmCo8WGgLFViqCB6prmcJy1QC9IhfuKWDPkeAOhtV63UKBCN%2Bs5sHs4ROtn79nuuB3fb%2FoIBN8oaJ0t7phCsoCBWMuDHYww0XYokCVTPjh%2B48OPE1XpDC39DNSJSGMTegiOtD9UnwRGqYDFEWgq1BnGPBiaNBI11gsw1b97N7Dmskwkw7MBtnu6LIWcRlctUQ8GBm8kNJloCu29n2STp7kP9R8zORUpYbn6xKjKJNkyj3pilUXyKTwiJX7WAVCSzjn5vdUpnEoXqcN%2BN9tgv8wCqFlUrvyNq3vfB0cpoONCecT8NX4obr7eXh9eTBf6Y8eO8pD%2F5IHgRGrDmQ3kzotBdrpUcJNbWZscycbLkuzKXMY0Yw9tuUMmoj7PXlCX2xlSpeQF%2B2byIfR1%2BCEbkugOmXu0yTxlkt9vx4ih%2FFH%2FECzAjnH44ZbrDvPK%2FXecJndp7gPTtPOBKHmBfEZPSPjqIPa1SKB9rSPRHd68nb9Jtg9oaqos3%2BU7qZG%2Fwh4R%2F%2FBQ%3D%3D)

#Components
##Location update function
A cloud function with http trigger, aims to handle end-user location update requests:

Example request:
* /updateLocation (POST)
    * uid
    * timestamp
    * latitude
    * longitude
    
Upon receiving a request, the function will extract the payload from request body. Then convert it to a document with 
partition key = timestamp, and write it to Firestore DB.

##Firestore DB
Document-based NoSQL database which are used to store each location update per user's request. User's traveling routes
can be retrieved from here if appropriate indexes is provides.

##on Location Update DB Trigger
A cloud function with Firestore trigger, aims to either create or update total distances traveled per user.
Caveat: should add timestamp check for lasted modification time to avoid currency issue.

##Cloud Database
Key-value based database in which we store total traveled distance per user.

#Deployment
Currently, everything run on emulators locally. 
```
firebase emulators:start
```
Deployment to google cloud should be as easy as: (I didn't test it since it asked me to provide billing information)
```
firebase deploy
```
Even more, for future CI/CD, this can integrate with firebase-ci, so we can staging and production environments.



