import moment from 'moment'

function formatMessages(username, text) {
    return {
        username,
        text,
        time: moment().format('H:mm')
    }
}

export default formatMessages;