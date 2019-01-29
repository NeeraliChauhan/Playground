import bcrypt from 'bcrypt';

export default {
  name: 'updateAdminPassword',
  args: {
    input: {
      type: {
        fields: {
          adminId: {
            type: Types.ID
          },
          currentPassword: {
            type: Types.String
          },
          newPassword: {
            type: Types.String
          }
        }
      }
    }
  },
  
  resolve: (_, { input }, { gql, req }) => {
    return new Promise((resolve, reject) => {

      getAdmin(gql, input.adminId)
        .then(admin => {
          console.log("---------", admin);
          matchPassword(input.currentPassword, admin.password)
            .then(r1 => {
              setPassword(gql, input.adminId, input.newPassword)
              .then((res) => {
                console.log("Password Updated")
                resolve(res)
              })
              .catch((err) => {
                console.log("Not Updated")
                reject(err)
              })
              resolve(true)
            })
            .catch(er1 => {
              reject(er1);
            })
        })
        .catch((err) => {
          reject(err)
        })

    })
    
  }

}


function matchPassword(password, hash) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, function(err, res) {
      if(res) {
       console.log("PASSWORD MATCH")
       resolve(true)
      } else {
       reject('PASSWORD DO NOT MATCH');
      } 
    });
  })
}


function setPassword(gql, id, password){
  return new Promise((resolve, reject) => {
   
    bcrypt.hash(password, 10, function(err, hash) {
      if(err) {
        reject(err);
        console.log("ERROR OCCURED")
      } else {
        console.log("........", hash)
        updatePassword(gql, id, hash)
          .then(res => {
          console.log("UPDATED")
          resolve(res);
          })
          .catch(err => {
            reject(err);
            console.log("NOT UPDATED")
          })
      }
    })
  })
 
}


function getAdmin(gql, _id) {
  const query = `
    query GetAdmin ($_id : ID!){
      admin{
        database{
          one(find: {
            _id: $_id
          })
          {
            _id
            password
            email
          }
        }
      }
    }
  `;

  return new Promise((resolve, reject) => {
    gql.query(query, 'admin.database.one',{
      variables: {
        _id
      }
    }).then(res => {
      resolve(res);
    })
    .catch(err => {
      reject(err);
    })
  })  

}

function updatePassword(gql, _id,  password) {
  const query = `
    mutation UpdatePassword($_id : ID!, $inputFields: Admins_UpdateInputType ){
      admin{
        database{
          update(_id : $_id, input: $inputFields)
        }
      }
    }
  `;

  return new Promise((resolve, reject) => {
    gql.mutation(query, 'admin.database.update',{
      variables: {
        _id,
        inputFields: {
          password
        }
      }
    }).then(res => {
      console.log('yahoo res ', res);
      resolve(res);
    })
    .catch(err => {
      console.log('yahoo errr', err);
      reject(err);
    })
  }) 
}
