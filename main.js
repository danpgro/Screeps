// - - - - - - - - - - - - - Energy Miners - - - - - - - - - - - - - - - -

function createEnergyMiner (energy,source) {
    const name = "EnergyMiner" + source.id + Game.time;
    Game.spawns["Spawn1"].spawnCreep(MinerClassArray(energy), name, {memory: {"Role":"Energy Miner"}});
}

function EnergyMinerControl (currentCreep) {
    sourceId = currentCreep.name.substring(11,26);
    var source = Game.getObjectById(sourceId);
    if (source == null){
        currentCreep.moveTo(4,47)
    } else{
        currentCreep.moveTo(source);
        currentCreep.harvest(source);
        if (currentCreep.store[RESOURCE_ENERGY] >= (currentCreep.store.getCapacity() - (currentCreep.store.getCapacity()%4) - 1)){
            dropOffTarget = currentCreep.pos.findInRange(FIND_STRUCTURES,1)
            currentCreep.repair(dropOffTarget[0]);
            currentCreep.transfer(dropOffTarget[0], RESOURCE_ENERGY)
            if (dropOffTarget == "") {
                currentCreep.drop(RESOURCE_ENERGY)
            }
        }
    }
}

// - - - - - - - - - - - - - Haulers - - - - - - - - - - - - - - - - - - - - -

function createHauler (energy,source) {
    const name = "Hauler" + source.id  + Game.time;
    Game.spawns["Spawn1"].spawnCreep(HaulerClassArray(energy), name, {memory: {"Role":"Hauler"}});
}

function HaulerControl (currentCreep) {
    sourceId = currentCreep.name.substring(6,21);
    const source = Game.getObjectById(sourceId);

    try{
        dropOffTarget = getDropPoint(source.room)

        collectEnergy = source.pos.findInRange(FIND_STRUCTURES, 2, {
            filter: {structureType: STRUCTURE_CONTAINER}
        })

        if(currentCreep.store[RESOURCE_ENERGY] < currentCreep.store.getCapacity()) {
            
            if (collectEnergy[0] != undefined) {
                if (collectEnergy[0] != dropOffTarget) {
                    collectEnergy = collectEnergy[0]
                } else{
                    currentCreep.moveTo(source)
                }
            } else {
                currentCreep.moveTo(source)
            }
            
            if (collectEnergy == ""){
                var droppedEnergy = currentCreep.room.find(FIND_DROPPED_RESOURCES)
                currentCreep.moveTo(droppedEnergy[0]);
                currentCreep.pickup(droppedEnergy[0]);
            } else{
                currentCreep.moveTo(collectEnergy);
                currentCreep.withdraw(collectEnergy, RESOURCE_ENERGY);
            }
        } else {
            currentCreep.moveTo(dropOffTarget);
            currentCreep.transfer(dropOffTarget, RESOURCE_ENERGY);
        }
    }  catch {
        currentCreep.moveTo(4,47)
    }

}

// - - - - - - - - - - - - - Disributors - - - - - - - - - - - - - - - - - - - - -

function createDistributor(energy) {
    const name = "Distributor" + Game.time;
    Game.spawns["Spawn1"].spawnCreep(HaulerClassArray(energy), name, {memory: {"Role":"Distributor"}});
}

function DistributorControl (currentCreep) {
    pickUpTarget = Game.getObjectById("6819ce861ff7ff29402e6061"); 
    pickUpTarget = getDropPoint(currentCreep.room)
    spawnDropOff = currentCreep.room.find(FIND_MY_STRUCTURES, {
        filter: {structureType: STRUCTURE_SPAWN}
    });
    var dropOffTarget = currentCreep.room.find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_EXTENSION}
})

    var towerDropOff = currentCreep.room.find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_TOWER}
    });

    distributingCheck = false
    targetEnergy = 50

    distributingCheck = distributorLogic(dropOffTarget, pickUpTarget, currentCreep, distributingCheck, targetEnergy)

    if (distributingCheck == false) {
        targetEnergy = 750
        if (towerDropOff[0].pos != undefined) {
            distributingCheck = distributorLogic(towerDropOff, pickUpTarget, currentCreep, distributingCheck, targetEnergy)
        }
    }

    if (distributingCheck == false) {
        var dropOffController = currentCreep.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_CONTROLLER}
        }); 

        controllerContainer = dropOffController[0].pos.findInRange(FIND_STRUCTURES,2,{
            filter: { structureType: STRUCTURE_CONTAINER}
        })

        targetEnergy = 1500

        if (controllerContainer[0].pos != undefined) {
            distributingCheck = distributorLogic(controllerContainer, pickUpTarget, currentCreep, distributingCheck, targetEnergy)  
        }
    }

    if (distributingCheck == false) {
        targetEnergy = 300
        distributingCheck = distributorLogic(spawnDropOff, pickUpTarget, currentCreep, distributingCheck, targetEnergy)
        // if (spawnDropOff[0].store[RESOURCE_ENERGY] < 300){
        //     if (currentCreep.store[RESOURCE_ENERGY] > currentCreep.store.getCapacity()*0.75) {
        //         distributingCheck = true;
        //         currentCreep.moveTo(spawnDropOff[0]);
        //         currentCreep.transfer(spawnDropOff[0], RESOURCE_ENERGY);
        //     } else{
        //         currentCreep.moveTo(pickUpTarget);
        //         currentCreep.withdraw(pickUpTarget, RESOURCE_ENERGY);
        //     }
        // }
    }
    
}

function distributorLogic (dropOffTarget, pickUpTarget, currentCreep, distributingCheck, targetEnergy) {
    distributingCheck = false
    for (option in dropOffTarget) {
        if (dropOffTarget[option].store[RESOURCE_ENERGY] < targetEnergy){
            if (currentCreep.store[RESOURCE_ENERGY] > 0) {
                distributingCheck = true;
                currentCreep.moveTo(dropOffTarget[option]);
                currentCreep.transfer(dropOffTarget[option], RESOURCE_ENERGY);
            } else{
                currentCreep.moveTo(pickUpTarget);
                currentCreep.withdraw(pickUpTarget, RESOURCE_ENERGY);
            }
        }
    }

    return distributingCheck

}

// - - - - - - - - - - - - - Upgraders - - - - - - - - - - - - - - - - - - - - -

function createUpgrader (energy) {
    const name = "Upgrader" + Game.time;
    Game.spawns["Spawn1"].spawnCreep(MinerClassArray(energy), name, {memory: {"Role":"Upgrader"}})
}

function UpgraderControl (currentCreep) {
    var dropOffController = currentCreep.room.find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_CONTROLLER}
    }); 

    controllerContainer = dropOffController[0].pos.findInRange(FIND_STRUCTURES,2,{
        filter: { structureType: STRUCTURE_CONTAINER}
    })

    //currentCreep.moveTo(controllerContainer);
    currentCreep.withdraw(controllerContainer[0], RESOURCE_ENERGY);
    currentCreep.repair(controllerContainer[0]);
    //if (currentCreep.store[RESOURCE_ENERGY] == 0) {
    //    currentCreep.moveTo(controllerContainer)
    //} else {
    currentCreep.upgradeController(dropOffController[0]);
    currentCreep.moveTo(dropOffController[0].pos);
    //}
}

// - - - - - - - - - - - - - Builders - - - - - - - - - - - - - - - - - - - - -

function createBuilder (energy) {
    const name = "Builder" + Game.time;
    Game.spawns["Spawn1"].spawnCreep(BuilderClassArray (energy), name, {memory: {"Role":"Builder"}})
}

function BuilderControl (currentCreep) {
    targetStructure = getDropPoint(currentCreep.room);
    currentCreep.withdraw(targetStructure, RESOURCE_ENERGY);
    if (currentCreep.store[RESOURCE_ENERGY] == 0) {
        currentCreep.moveTo(targetStructure)
    } else {
        constructionTargets = findBuildSites(Game.rooms)
        currentCreep.moveTo(constructionTargets[0])
        currentCreep.build(constructionTargets[0])
    }

}

function findBuildSites(occupiedRooms) {
    var ConstructionSites = []
    for (var room in occupiedRooms) {
        roomSites = occupiedRooms[room].find(FIND_CONSTRUCTION_SITES)
        for (var site in roomSites){
            ConstructionSites.push(roomSites[site]);
        }
    }
    return ConstructionSites
}

// - - - - - - - - - - - - - Repairers - - - - - - - - - - - - - - - - - - - - -

function createRepairer (energy) {
    const name = "Repairer" + Game.time;
    Game.spawns["Spawn1"].spawnCreep(BuilderClassArray (energy), name, {memory: {"Role":"Repairer"}})
}

function RepairerControl (currentCreep) {
    allStructures = currentCreep.room.find(FIND_MY_STRUCTURES)
    repairCheck = false
    for (building in allStructures){
        if (allStructures[building].hits < (0.75 * allStructures[building].hitsMax)){
            //If I have issues it might be worth trying to move this
            // move command out of the for loop
            currentCreep.moveTo(allStructures[building]);
            currentCreep.repair(allStructuresp[building]);
            repairCheck = true
        }
    }
    if (repairCheck == false) {
        BuilderControl(currentCreep)
    }
}

// - - - - - - - - - - - - - Scout - - - - - - - - - - - - - - - - - - - - -

function createScout (energy) {
    const name = "Scout" + Game.time;
    Game.spawns["Spawn1"].spawnCreep(ScoutClassArray (energy), name, {memory: {"Role":"Scout"}})
}

function ScoutControl (currentCreep) {
    const position = new RoomPosition(25, 25, "W2N8");
    currentCreep.moveTo(position);
}

// - - - - - - - - - - - - - Soldiers - - - - - - - - - - - - - - - - - - - - -

function createRapidResponseFighter(energy) {
    const name = "RapidResponseFighter" + Game.time;
    Game.spawns["Spawn1"].spawnCreep(RapidResponseFighterArray (energy), name, {memory: {"Role":"Soldier"}})

}

function RapidResponseFighterControl (currentCreep, hostileArray) {
    for (room in Game.rooms) {
        hostiles = Game.rooms[room].find(FIND_HOSTILE_CREEPS);
        if (hostiles[1] != undefined) {
            console.log("TARGETS SPOTTED ARMED FORCES ON ROUTE")
            target = getClosestRoom(currentCreep.room,hostiles)
            AttackIntoMelee(currentCreep,target);
        } else if (hostiles[0] != undefined) {
            console.log("TARGET SPOTTED ARMED FORCES ON ROUTE")
            target = hostiles[0];
            AttackIntoMelee(currentCreep,target);
        } else{
            barracks = SearchFlags("Barracks")[0]
            currentCreep.moveTo(barracks)
        }
    }
}

function AttackIntoMelee (currentCreep,target){
    if (currentCreep.room != target.room){
        currentCreep.moveTo(target)
    } else{
        closestTarget = currentCreep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
        allHostiles = currentCreep.room.find(FIND_HOSTILE_CREEPS)
        currentCreep.moveTo(closestTarget)
        currentCreep.rangedAttack(closestTarget)
        currentCreep.attack(closestTarget)
    }
}

// - - - - - - - - - - - - - Towers - - - - - - - - - - - - - - - - - - - - -

function towerControl (currentTower) {
    var closestHostile = currentTower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    var friendlyCreeps = currentTower.room.find(FIND_MY_CREEPS)
    
    if (closestHostile) {
        currentTower.attack(closestHostile)
    } else {
        healCheck = false
        for (creep in friendlyCreeps) {
            targetFriendly = friendlyCreeps[creep]
            if (targetFriendly.hits < targetFriendly.hitsMax) {
                currentTower.heal(targetFriendly)
                healCheck = true
            }
        }
        if (!healCheck) {
            structureSearch = currentTower.room.find(FIND_STRUCTURES)
            for (structure in structureSearch) {
                targetStructure = structureSearch[structure]
                if (targetStructure.hits < targetStructure.hitsMax * 0.8) {
                    currentTower.repair(targetStructure)
                }
            }
        }
    }

}

// - - - - - - - - - - - - - Source Management - - - - - - - - - - - - - - - - - - - - -

function findSources(room) {
    sources = room.find(FIND_SOURCES_ACTIVE)
    return sources
}

// - - - - - - - - - - - - - Non-Class Specific Code- - - - - - - - - - - - - - - - - - - - -

function iterateCreeps () {
    var EnergyMinerCount = 0
    var HaulerCount = 0
    var UpgraderCount = 0
    var BuilderCount = 0
    var DistributorCount = 0
    var RepairerCount = 0
    var ScoutCount = 0
    var RapidResponseFighterCount = 0
    for (var creepName in Game.creeps) {
        if (creepName.startsWith("EnergyMiner")) {
            EnergyMinerControl(Game.creeps[creepName])
            EnergyMinerCount += 1;
        } else if (creepName.startsWith("Hauler")) {
            HaulerControl(Game.creeps[creepName])
            HaulerCount += 1;
        } else if (creepName.startsWith("Upgrader")) {
            UpgraderControl(Game.creeps[creepName])
            UpgraderCount += 1;
        } else if (creepName.startsWith("Builder")) {
            BuilderControl(Game.creeps[creepName])
            BuilderCount += 1;
        } else if (creepName.startsWith("Distributor")) {
            DistributorControl(Game.creeps[creepName])
            DistributorCount += 1;
        } else if (creepName.startsWith("Repairer")) {
            RepairerControl(Game.creeps[creepName])
            RepairerCount += 1;
        } else if (creepName.startsWith("Scout")) {
            ScoutControl(Game.creeps[creepName])
            ScoutCount += 1;
        } else if (creepName.startsWith("RapidResponseFighter")) {
            RapidResponseFighterControl(Game.creeps[creepName])
            RapidResponseFighterCount += 1;
        }
    }

    //Emergency creates
    if (DistributorCount == 0) {
        createDistributor(100)
    } else if (DistributorCount == 1) {
        createDistributor(300)
    }

    if (RapidResponseFighterCount == 0) {
        createRapidResponseFighter(400)
    }

    // if (EnergyMinerCount == 0) {
    //     createEnergyDropMiner(200)
    // }
    //Normal Creates

    var masterEnergy = 400
    var TotalCount = EnergyMinerCount + HaulerCount + UpgraderCount + BuilderCount + DistributorCount + RepairerCount

    if ( TotalCount > 27) {
        masterEnergy = Math.floor((Game.spawns["Spawn1"].room.energyCapacityAvailable/100))*100-300
    }
    
    if (DistributorCount < 3) {
        createDistributor(masterEnergy)
    } else if (RapidResponseFighterCount < 2){
        if (masterEnergy > 399) {
            createRapidResponseFighter(masterEnergy)
        }
    } else if (UpgraderCount < 2) {
        createUpgrader(masterEnergy)
    } else if (BuilderCount < 3) {
        createBuilder(masterEnergy)
    } else if (RepairerCount < 0) {
        createRepairer(masterEnergy)
    } else if (ScoutCount < 1) {
        createScout(masterEnergy)
    }

    console.log("Master Energy: " + masterEnergy)

    if ((Game.time + 5) % 10 == 0) {
        console.log()
        console.log("Energy Miners: " + EnergyMinerCount)
        console.log("Haulers: " + HaulerCount)
        console.log("Upgraders: " + UpgraderCount)
        console.log("Builders: " + BuilderCount)
        console.log("Distributors: " + DistributorCount)
        console.log("Repairers: " + RepairerCount)
        console.log("Scouts: " + ScoutCount)
        console.log("Rapid Reponse Fighters: " + RapidResponseFighterCount)
        console.log()
    }

    return masterEnergy
}

function findStructure(room, search){
    structureSearch = room.find(FIND_STRUCTURES, {
        filter : {structureType : search}})
    
    return structureSearch
}

function iterateOccupiedRooms(occupiedRooms, masterEnergy) {
    iteratedRooms = []
    for (var room in occupiedRooms) {
        roomIteration(occupiedRooms[room],masterEnergy)
        iteratedRooms.push(occupiedRooms[room])
    }
    console.log("Active rooms: " + iteratedRooms)
}

function roomIteration(room,masterEnergy) {
    iterateStructures(room)
    roomSources = findSources(room)

    for (source in roomSources) {
        currentSource = roomSources[source]
        ownedMiners = SearchCreeps("EnergyMiner"+currentSource.id)
        ownedHaulers = SearchCreeps("Hauler"+currentSource.id)

        distanceMultiplier = compareRoomDistance(room,getDropPoint(room).room) + 1

        if (ownedMiners.length < 1) {
            createEnergyMiner(200,currentSource)
        } else if (ownedMiners.length < 2) {
            createEnergyMiner(300,currentSource)
        } else if (ownedMiners.length < 3) {
            createEnergyMiner(400,currentSource)
        }
        if (ownedHaulers.length < 1*distanceMultiplier) {
            createHauler(200,currentSource)
        } else if (ownedHaulers.length < 2*distanceMultiplier) {
            createHauler(masterEnergy,currentSource)
        }
    
    }
}

function iterateStructures(room) {
    var TowerCount = 0
    towerList = room.find(FIND_STRUCTURES, {
        filter : {structureType : STRUCTURE_TOWER}})
    
    for (tower in towerList) {
        TowerCount ++
        towerControl(towerList[tower])
    }
}

function SearchCreeps (Class) {
    foundCreeps = []
    for (var creepName in Game.creeps) {
        if (creepName.startsWith(Class)) {
            foundCreeps.push(Game.creeps[creepName])
        }
    }
    return foundCreeps
}

function getClosestRoom (origin,list){
    var closestTarget = null
    var closestDistance = 100
    for (index in list){
        checkedDistance = compareRoomDistance(origin,list[index].room)
        if (checkedDistance < closestDistance){
            closestTarget = list[index]
            closestDistance = checkedDistance
        }
    }
    return closestTarget
}

function getDropPoint (travellingFrom) {
    const flagList = SearchFlags("DropPoint");

    // closestFlag = null
    // closestFlagDistance = 100

    // for (flag in flagList){
    //     checkedDistance = compareRoomDistance(travellingFrom,flagList[flag].room)
    //     if (checkedDistance < closestFlagDistance){
    //         closestFlag = flagList[flag]
    //         closestFlagDistance = checkedDistance
    //     }
    // }
    targetFlag = getClosestRoom(travellingFrom,flagList)

    var dropOffObject = null
    targetList = targetFlag.room.lookForAt(LOOK_STRUCTURES,targetFlag.pos)
    for (target in targetList){
        if (targetList[target].structureType == STRUCTURE_CONTAINER){
            dropOffObject = targetList[target]
        } else if (targetList[target].structureType == STRUCTURE_STORAGE){
            dropOffObject = targetList[target]
        }
    }
    return dropOffObject
}

function compareRoomDistance (room1, room2){
    roomName1 = room1.name
    roomName2 = room2.name
    room1X = roomName1.substring(1,2)
    room2X = roomName2.substring(1,2)
    room1Y = roomName1.substring(3,4)
    room2Y = roomName2.substring(3,4)
    deltaX = Math.abs(room1X - room2X)
    deltaY = Math.abs(room1Y - room2Y)
    distance = deltaX + deltaY
    return distance
}

function SearchFlags (query) {
    flagList = []
    for (var flagName in Game.flags) {
        if (flagName.startsWith(query)) {
            flagList.push(Game.flags[flagName])
        }
    }
    return flagList
}

function MemoryCleanup () {
    console.log("Cleanup in Progress")
    for (var creep in Memory.creeps) {
        if(!Game.creeps[creep]) {
            delete Memory.creeps[creep];
        }
    }
    console.log("Cleanup completed")
}

// - - - - - - - - - - - - - Worker "Classes" - - - - - - - - - - - - - - - - - - - - -

function HaulerClassArray (energy) {
    //50% Carry 50% Move
    tickets = energy / 50
    var array = []
    carryCount = Math.floor(tickets*0.5)
    moveCount = Math.floor(tickets*0.5)
    for (var count = 0; count < carryCount; count++){
        array.push(CARRY)
    }
    for (var count = 0; count < moveCount; count++){
        array.push(MOVE)
    }
    return array
}

function MinerClassArray (energy) {
    //1 Carry 1 Move Everything else Work
    tickets = energy / 50
    var array = []
    array.push(CARRY)
    tickets--
    array.push(MOVE)
    tickets--
    workCount = Math.floor(tickets*0.5)
    for (var count = 0; count < workCount; count++){
        array.push(WORK)
    }
    return array
}

function BuilderClassArray (energy) {
    //Work (50% of tickets) = Carry (25%) = Move (25%)
    tickets = energy / 50
    var array = []
    workCount = Math.floor(tickets*0.5*0.5)
    carryCount = Math.floor(tickets*0.25)
    moveCount = Math.floor(tickets*0.25)
    for (var count = 0; count < carryCount; count++){
        array.push(CARRY)
    }
    for (var count = 0; count < moveCount; count++){
        array.push(MOVE)
    }
    for (var count = 0; count < workCount; count++){
        array.push(WORK)
    }
    return array
}

function ScoutClassArray (energy) {
    //Move 100%
    tickets = energy / 50
    var array = []
    moveCount = Math.floor(tickets)
    for (var count = 0; count < moveCount; count++){
        array.push(MOVE) 
    }
    return array
}

function RapidResponseFighterArray (energy) {
    //1 attack (+2 tough), 1 ranged_attack, then the rest is move and tough
    tickets = energy / 50
    var array = []

    tickets = tickets - 5

    array.push(ATTACK)
    array.push(RANGED_ATTACK)
    array.push(TOUGH)
    array.push(TOUGH) 

    moveCount = Math.floor(tickets)
    for (var count = 0; count < moveCount; count++){
        array.push(MOVE) 
    }

    return array
}

// - - - - - - - - - - - - - Main Loop - - - - - - - - - - - - - - - - - - - - -

module.exports.loop = function () {
    console.log()
    console.log("Loop " + Game.time)
    console.log()

    masterEnergy = iterateCreeps()
    iterateOccupiedRooms(Game.rooms,masterEnergy)
    if (Game.time % 100 == 0) {
        MemoryCleanup()
    }
    console.log("Spawnable Energy : " + Game.spawns["Spawn1"].room.energyAvailable + " / " + Game.spawns["Spawn1"].room.energyCapacityAvailable)
    //console.log(findSources(Game.spawns["Spawn1"].room))
}