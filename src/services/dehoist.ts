export default function (stringToFilter: string, starterChar: string = "9") : string {
    let filteredString = stringToFilter

    while (filteredString[0] < starterChar && filteredString != "") {
        filteredString = filteredString.slice(1)
    }

    filteredString = filteredString.trim()

    return filteredString || "no hoisting"
}