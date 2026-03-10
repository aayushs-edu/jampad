const itchy = require("itchy")
async function main(){
    let data = await itchy.getJamData("https://itch.io/jam/brackeys-14")
    console.log(data)
}
main()