class UserController {
    constructor(formId, tableId) {

        this.formEl = document.getElementById(formId)
        this.tableEl = document.getElementById(tableId)
        this.onSubmit()
    }

    onSubmit() {

        this.formEl.addEventListener('submit', event => {
            event.preventDefault()

            const btn = this.formEl.querySelector('[type=submit]')
            btn.disabled = true

            const values = this.getValues()
            this.getPhoto().then(

                result => {
                    values.photo = result
                    this.addLine(values)

                    this.formEl.reset()
                    btn.disabled = false
                },
                error => {
                    console.error(error)
                }
            )
        })
    }

    getPhoto() {
        return new Promise((resolve, reject) => {

            const fileReader = new FileReader
            const elements = [...this.formEl.elements].filter(item => {
                if (item.name === 'photo') {
                    return item
                }
            })

            const file = elements[0].files[0]

            fileReader.onload = () => {
                resolve(fileReader.result)
            }

            fileReader.onerror = error => {
                reject(error)
            }

            if (file) {
                fileReader.readAsDataURL(file)
            } else {
                resolve('dist/img/boxed-bg.jpg')
            }
        })
    }

    getValues() {

        let user = {}
        const elements = [...this.formEl.elements]
        let isValid = true
        const requiredData = ['name', 'email', 'password']

        elements.forEach((field, index) => {
            
            if(requiredData.indexOf(field.name) > -1 && !field.value) {
                field.parentElement.classList.add('has-error')
                isValid = false
            }

            if (field.name == 'gender') {
                if (field.checked) {
                    user[field.name] = field.value
                }
            } else if (field.name === 'admin') {
                user[field.name] = field.checked
            } else {
                user[field.name] = field.value
            }
        })

        if(!isValid) {
            return false
        }

        return new User(
            user.name,
            user.gender,
            user.birth,
            user.country,
            user.email,
            user.password,
            user.photo,
            user.admin
        )
    }

    addLine(dataUser) {

        const tr = document.createElement('tr')
        tr.innerHTML =
            `
            <td>
            <img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm">
            </td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${(dataUser.admin) ? 'Sim' : 'Não'}</td>
            <td>${dataUser.register.toLocaleDateString('pt-br')}</td>
            <td>
            <button type="button" class="btn btn-primary btn-xs btn-flat">Editar</button>
            <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
            </td>
            `
        this.tableEl.appendChild(tr)
    }

}