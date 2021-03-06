/**
* cousteau <https://github.com/jahnestacado/cousteau>
* Copyright (c) 2017 Ioannis Tzanellis
* Licensed under the MIT License (MIT).
*/
"use strict"

const utils = {
    promisifyFs(func, shouldFailSilently=false) {
        return function(...args){
            return new Promise((resolve, reject) => {
                const onDone = (error, result) => {
                    if(error && shouldFailSilently){
                        resolve(error);
                    } else {
                        error ? reject(error) : resolve(result);
                    }
                };
                args.push(onDone);
                func(...args);
            });
        };
    },
    collectResults(promises, cousteauResult, onDone, onError) {
        Promise.all(promises).then((allRes) => {
            cousteauResult = allRes.reduce((res, current) => {
                if(utils.isError(current)){
                    cousteauResult.errors.push(current);
                } else if(current) {
                    Object.keys(res).forEach((attr) => {
                        res[attr] = res[attr].concat(current[attr]);
                    });
                }
                return res;
            }, cousteauResult);

            onDone(cousteauResult);
        })
        .catch(onError);
    },
    isError: (obj) => obj instanceof Error,
    isIgnored(options, stats) {
        let ingored = false;
        if(options){
            const keys = Object.keys(options);
            ingored = keys.reduce((answer, key) => {
                if(options[key] && stats[key]){
                    answer = options[key](stats[key]) || answer;
                }
                return answer;
            }, false);
        }
        return ingored;
    },
    mergeTargetStats(linkStats, targetStats) {
        const path = linkStats.parentLink || linkStats.path;
        const stats = Object.assign({}, targetStats, {
            path,
            isSymbolicLink: () => true,
        });
        return stats;
    },
};

module.exports = utils;
