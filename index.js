
if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    alert('Please install MetaMask!')
}

var compiler;
var solcVersion = '0.4.24';

function status(msg){
    document.getElementById('js-status').innerHTML = msg;
}

window.onload = function () {
    if (!BrowserSolc) throw new Error();

    status('Loading Solc...');
    BrowserSolc.getVersions(function (soljsonSources, soljsonReleases) {
        var version = soljsonReleases[solcVersion];
        BrowserSolc.loadVersion(version, function (c) {
            status('Solc loaded.');
            compiler = c;
        });
    });


    document.getElementById('js-deploy').addEventListener('click', deploy);
}

function deploy() {
    if (!compiler) throw new Error();

    setDeployButtonDisable(true);
    status("Compiling contract...");

    compiledContract = compiler.compile(getSourceCode(), 1);
    if (compiledContract) setDeployButtonDisable(false);
    
    console.log('Compiled Contract :: ==>', compiledContract);
    status("Compile Complete.");

    var contracts = compiledContract.contracts;
    Object.keys(contracts).forEach((name, i) => {
        const contract = contracts[name];
        const gas = contract.gasEstimates.creation;

        if (!confirm('Deploy!')) return

        const { bytecode, interface } = contract;
        const newContract = web3.eth.contract(JSON.parse(interface));
        const options = { from: web3.eth.accounts[0], data: bytecode, gas: 1000000 };
        
        newContract.new(options, function(err, contract){
            if(!contract.address){
                status(`Deploying contract..`);
            } else {
                status('https://ropsten.etherscan.io/address/' + contract.address);
            }
        });
    });
}

function setDeployButtonDisable (state) {
    document.getElementById("js-deploy").disabled = state;
}

function getSourceCode() {
    return document.getElementById("js-contract").value;
}