import bycrpt from 'bcrypt';

export default {
  name: 'createAdmin',
  args: {
    input: {
      type: "AdminsInputType"
    }
  },
  
  resolve: (_, { input }, { gql, req }) => {
    return new Promise((resolve, reject) => {
      getAdmin(gql, input.email)
        .then((res) => {
          if(res && res._id) {
            reject('Email already exist');
          } else {
            
            const password = input.password;
            bycrpt.hash(password, 10, function(err, hash) {
              if(err) {
                reject(err);
              } else {
                createAdmin(gql, {...input, password: hash})
                  .then(res => {
                    resolve(res);
                  })
                  .catch(err => {
                    reject(err);
                  })
              }
            })

          }
        })
        .catch((err) =>{
          reject(err);
        })
      

    })
  }

}


function createAdmin(gql, inputs) {
  const query = `
    mutation CreateAdmin ($inputs: AdminsInputType!){
      admin {
        database {
          create(input: $inputs) {
            _id
            password
            email
          }
        }
      }
    }
  `;
  return gql.mutation(query, 'admin.database.create', {
    variables: {
      inputs
    }
  });
}

function getAdmin(gql, email) {
  const query = `
    query GetAdmin ($email :  String!) {
      admin {
        database{
          one(find: {
            email: $email
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
    gql.query(query, 'admin.database.one', {
      variables: {
       email
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
