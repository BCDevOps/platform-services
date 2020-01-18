const fs = require('fs');
const path = require('path');

const scalar = 1000;
const basePath = path.join(__dirname, 'test');

const median = (data) => {
    const sorted = data.map(d => d['time_total']).sort();
    const midway = data.length / 2;
    
    if (sorted.length % 2) {
        return sorted[midway];
    }

    return (sorted[midway - 1] + sorted[midway]) / 2.0;
};

const report = (data) => {
    const averageTime = data.map(d => d['time_total']).reduce((a,c) => a+c) / data.length;
    const maxTime = data.map(d => d['time_total']).reduce((a,c) => Math.max(a, c));
    const minTime = data.map(d => d['time_total']).reduce((a,c) => Math.min(a, c));
    
    console.log(`    Sample Size: ${data.length}`);
    console.log(`       Min Time: ${Math.round(minTime * scalar) / scalar * 1000}ms`);
    console.log(`       Max Time: ${Math.round(maxTime * scalar) / scalar * 1000}ms`);
    console.log(`    Median Time: ${Math.round(median(data) * scalar) / scalar * 1000}ms`);
    console.log(`   Average Time: ${Math.round(averageTime * scalar) / scalar * 1000}ms`);
};

const main = async () => {
    const contents = fs.readdirSync(basePath).filter(f => f.indexOf('.dat') >= 0);
   
    contents.forEach(f => {
        const buff = fs.readFileSync(path.join(basePath, f));
        const dataAsString = `[${buff.toString('utf8').trim().slice(0, -1)}]`;
        const data = JSON.parse(dataAsString);
    
        console.log(`Reporting On ${f}`);
        report(data);
    });
   

    // const result = {};
    // Object.keys(data[0]).forEach(key => {
    //     result[key] = data.map(d => d[key]).reduce((a,c) => a+c);
    // });
};

main();
