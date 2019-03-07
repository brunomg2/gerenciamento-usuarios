class UserController {

    constructor(formIdCreate, formIdUpdate, tableId) {
        this.formEl = document.getElementById(formIdCreate)
        this.formUpdateEl = document.getElementById(formIdUpdate)
        this.tableEl = document.getElementById(tableId)
        this.onSubmit()
        this.onEdit()
        this.selectAll()
    }

    onEdit() {
        document.querySelector('#box-user-update .btn-cancel').addEventListener('click', event => {
            this.showPainelCreate()
        })

        this.formUpdateEl.addEventListener('submit', event => {
            event.preventDefault()
            const buttonSubmit = this.formUpdateEl.querySelector('[type=submit]')

            buttonSubmit.disabled = true
            const values = this.getValues(this.formUpdateEl)

            const index = this.formUpdateEl.dataset.trIndex
            let tr = this.tableEl.rows[index]

            const userOld = JSON.parse(tr.dataset.user)
            const result = Object.assign({}, userOld, values)

            this.getPhoto(this.formUpdateEl).then(
                content => {

                    if (!values.photo) {
                        result._photo = userOld._photo
                    } else {
                        result._photo = content
                    }

                    const user = new User()
                    user.loadFromJSON(result)
                    user.save()

                    this.getTr(user, tr)
                    this.addEventsTr(tr)
                    this.updateCount()

                    buttonSubmit.disabled = false
                    this.formUpdateEl.reset()
                    this.showPainelCreate()
                },
                error => {
                    console.error(error)
                }
            )
        })
    }

    onSubmit() {
        this.formEl.addEventListener('submit', event => {
            event.preventDefault()

            const buttonSubmit = this.formEl.querySelector('[type=submit]')

            buttonSubmit.disabled = true

            let values = this.getValues(this.formEl)

            if (!values) {
                buttonSubmit.disabled = false
                return false
            }

            this.getPhoto(this.formEl).then(
                content => {
                    values.photo = content

                    values.save()
                    this.addLine(values)
                    this.formEl.reset()

                    buttonSubmit.disabled = false
                },
                error => {
                    console.error(error)
                }
            )
        })
    }

    getPhoto(formEl) {
        return new Promise((resolve, reject) => {

            const fileReader = new FileReader()

            const elements = [...formEl.elements].filter(item => {
                if (item.name === 'photo') {
                    return item
                }
            })

            const file = elements[0].files[0]

            fileReader.onload = () => {
                resolve(fileReader.result)
            }

            fileReader.onerror = err => {
                reject(err)
            }

            if (file) {
                fileReader.readAsDataURL(file)
            } else {
                resolve('/dist/img/boxed-bg.jpg')
            }
        })
    }

    getValues(formEl) {
        const user = {}
        let isValid = true
        const fields = [...formEl.elements]

        fields.forEach(field => {

            if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value) {
                field.parentElement.classList.add('has-error')
                isValid = false
            }

            if (field.name === 'gender') {
                if (field.checked) {
                    user[field.name] = field.value
                }
            } else if (field.name === 'admin') {
                user[field.name] = field.checked
            } else {
                user[field.name] = field.value
            }
        })

        if (!isValid) {
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

    selectAll() {
        const users = User.getUsersStorage()
        users.forEach(dataUser => {
            const user = new User()
            user.loadFromJSON(dataUser)
            this.addLine(user)
        })
    }

    addLine(dataUser) {
        const tr = this.getTr(dataUser)
        
        this.tableEl.appendChild(tr)
        
        this.updateCount()
    }

    getTr(dataUser, tr = null) {
        
       if (tr === null) tr = document.createElement('tr')

       tr.dataset.user = JSON.stringify(dataUser)

        tr.innerHTML = `
            <td>
                <img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm">
            </td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${(dataUser.admin) ? 'Sim' : 'Não'}</td>
            <td>${Utils.dateFormat(dataUser.register, 'pt-br')}</td>
            <td>
                <button type="button" class="btn btn-edit btn-primary btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-delete btn-danger btn-xs btn-flat">Excluir</button>
            </td>
        `
        this.addEventsTr(tr)
        return tr
    }

    addEventsTr(tr) {
        tr.querySelector('.btn-delete').addEventListener('click', () => {
            if (confirm('Deseja Realmente excluir? ')) {
                const user = new User()
                
                user.loadFromJSON(JSON.parse(tr.dataset.user))
                user.remove()
                tr.remove()
                this.updateCount()
            }
        })

        tr.querySelector('.btn-edit').addEventListener('click', () => {
            const json = JSON.parse(tr.dataset.user)
            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex
            for (let name in json) {

                let field = this.formUpdateEl.querySelector(`[name = ${name.replace('_', '')}]`)

                if (field) {
                    switch (field.type) {
                        case 'file':
                            continue
                        case 'radio':
                            field = this.formUpdateEl.querySelector(`[name = ${name.replace('_', '')}][value= ${json[name]}]`)
                            field.checked = true
                            break
                        case 'checkbox':
                            field.checked = json[name]
                            break
                        default:
                            field.value = json[name]
                    }
                }
            }
            this.formUpdateEl.querySelector('.photo').src = json._photo
            this.showPainelUpdate()
        })
    }

    showPainelCreate() {
        document.querySelector('#box-user-create').style.display = 'block'
        document.querySelector('#box-user-update').style.display = 'none'
    }

    showPainelUpdate() {
        document.querySelector('#box-user-create').style.display = 'none'
        document.querySelector('#box-user-update').style.display = 'block'
    }

    updateCount() {
        const statisticUser = {
            users: 0,
            admin: 0
        };

        [...this.tableEl.children].forEach(tr => {
            statisticUser.users++

            const user = JSON.parse(tr.dataset.user)
            if (user._admin) statisticUser.admin++
        })

        document.querySelector('#number-users').innerHTML = statisticUser.users
        document.querySelector('#number-users-admin').innerHTML = statisticUser.admin
    }
}