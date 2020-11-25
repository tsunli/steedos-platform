import { Dictionary } from '@salesforce/ts-types';
import { getObjectConfig, getDataSource, SteedosObjectPermissionTypeConfig } from '../types'
import _ = require('lodash');
var util = require('../util');
var clone = require('clone');

const _lazyLoads: Dictionary<any> = {};

const addLazyLoad = function(objectName: string, json: SteedosObjectPermissionTypeConfig){
    if(!_lazyLoads[objectName]){
        _lazyLoads[objectName] = []
    }
    _lazyLoads[objectName].push(json)
}

const getLazyLoads = function(objectName: string){
    return _lazyLoads[objectName]
}

export const lazyloadPermissions = function(objectName: string){
    let permissions = getLazyLoads(objectName);
    _.each(permissions, function(permission){
        addPermissionConfig(permission.object_name, clone(permission));
    })
}

export const addPermissionConfig = (objectName: string, json: SteedosObjectPermissionTypeConfig)=>{
    if (!json.object_name) {
        throw new Error('missing attribute object_name')
    }
    let object = getObjectConfig(json.object_name);
    if (object) {
        getDataSource(object.datasource).setObjectPermission(objectName, json);
    } else {
        addLazyLoad(objectName, json);
    }
}

export const loadObjectPermissions = function (filePath: string){
    let permissions = util.loadPermissions(filePath);
    permissions.forEach(permission => {
        addPermissionConfig(permission.object_name, permission);
    });
}