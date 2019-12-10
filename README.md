
##### Welcome
 - theme will be heavily influenced by stack overflow
 - Im using docker to containerise the application
 - if you're not using docker
   - just do npm run start, and it should run on port 1975
   - mongodb has to be installed and the login script has to be changed to reflect the mongodb instance (includes/model.ts#11)
 - if you are using docker
   - to install just do `docker-compose up` and it should run on localhost:2000
   - no mongodb install is necessary as a second docker container (with default credentials) is going to be made and house all the app data
 - this setup is way overpowered just to do a simple message app, but i want to get the point across of what i can do
   - i am using typescript and hbs for the backend
   - scss (compiled to css) and mongodb for the frontend
 
The App
------------




##### REST API ref
    https://medium.com/javascript-in-plain-english/creating-a-rest-api-with-jwt-authentication-and-role-based-authorization-using-typescript-fbfa3cab22a4

##### working with TS & mongoose
    https://medium.com/@tomanagle/strongly-typed-models-with-mongoose-and-typescript-7bc2f7197722

###### disclaimers
I am not responsible for any damages arisen from this code. 

I take full ownership of this code and release no rights to it except if expressly given.
