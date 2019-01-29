import bcrypt from 'bcrypt';

export default {
  name: 'Login',
  args: {
    input: {
      type: {
        fields: {
          email: {
            type: Types.String
          },
          password : {
            type: Types.String
          }
        }
      }
    }
  },
  
  resolve: (_, { input }, { gql, req }) => {
    return new Promise((resolve, reject) => {
      getAdmin(gql, input.email)
        .then(admin => {
          matchPassword(input.password, admin.password)
            .then(r1 => {
              resolve(admin)
            })
            .catch(er1 => {
              reject(er1);
            })
        })
        .catch(err => {
          reject("Credentials does not match")
        })

    })
    
  }

}

function matchPassword(password, hash) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, function(err, res) {
      if(res) {
       resolve(true)
      } else {
       reject('Incorrect Password');
      } 
    });
  })
}

function getAdmin(gql, email) {
  const query = `
    query GetAdmin ($email :  String!) {
      Admin {
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
    gql.query(query, 'Admin.database.one', {
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

