const fields = document.querySelectorAll('#form-user-create [name]')
const user = {}

document.getElementById('form-user-create').addEventListener('submit', event => {
    event.preventDefault()
    
    fields.forEach(function (field, index) {
        if (field.name == 'gender' && field.checked) {
            user[field.name] = field.value
        } else {
            user[field.name] = field.value
        }
    })
    
    console.log(user)
})