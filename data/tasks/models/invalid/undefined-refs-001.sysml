/**
 * Invalid VehicleModel - Undefined References
 * Based on: GfSE/SysML-v2-Models/models/SE_Models/VehicleModel.sysml
 * ERROR TYPE: SEMANTIC - References to undefined types and elements
 */
package VehicleModel {
    import Definitions::*;
    package Definitions {
        import PartDefinitions::*;
        import PortDefinitions::*;
        import UndefinedPackage::*;  // ERROR: UndefinedPackage does not exist
        
        package PartDefinitions {
            part def Vehicle {
                attribute mass :> ISQ::mass;
                attribute dryMass :> ISQ::mass;
                attribute velocity :> UndefinedType::speed;  // ERROR: UndefinedType does not exist
                attribute acceleration :> ISQ::acceleration;
                attribute electricalPower :> PowerUnit::watt;  // ERROR: PowerUnit does not exist
                attribute Tmax :> ISQ::temperature;
                attribute maintenanceTime: Time::DateTime;
                attribute brakePedalDepressed: Boolean;
                port fuelCmdPort: FuelCmdPort;
                port vehicleToRoadPort: RoadInterfacePort;  // ERROR: RoadInterfacePort not defined
                perform action providePower;
                perform action performSelfTest;
                perform action startEngine;  // ERROR: startEngine action not defined
                exhibit state vehicleStates;
            }
            part def Engine;
            part def Cylinder;
            part def Transmission;
            part def Driveshaft;
            part def AxleAssembly;
            part def Axle {
                attribute mass :> ISQ::mass;
            }
            part def FrontAxle :> RearAxle {  // ERROR: Wrong parent type (should be Axle)
                attribute steeringAngle: ScalarValues::Real;
            }
            part def HalfAxle;
            part def Differential;
            part def Wheel {
                attribute diameter: LengthValue;
            }
            part def FuelTank {
                attribute mass :> ISQ::mass;
                ref item fuel: Gasoline {  // ERROR: Gasoline not defined (should be Fuel)
                    attribute redefines fuelMass;
                }
                attribute fuelMassMax :> ISQ::mass;
            }
        }
        package PortDefinitions {
            port def FuelCmdPort {
                in item fuelCmd: FuelCommand;  // ERROR: FuelCommand not defined (should be FuelCmd)
            }
            port def DrivePwrPort {
                out engineTorque: TorqueValue;  // ERROR: TorqueValue not defined (should be Torque)
            }
            port def ClutchPort;
            port def VehicleToRoadPort;
        }
        package ItemDefinitions {
            item def Fuel {
                attribute fuelMass :> ISQ::mass;
            }
            item def FuelCmd;
        }
        package ActionDefinitions {
            action def ProvidePower {
                in item fuelCmd: FuelCommand;  // ERROR: FuelCommand not defined
                out wheelToRoadTorque: TorqueOutput[2];  // ERROR: TorqueOutput not defined
            }
            action def GenerateTorque {
                in item fuelCmd: FuelCmd;
                out engineTorque: MotorTorque;  // ERROR: MotorTorque not defined
            }
        }
        package StateDefinitions {
            state def VehicleStates;
            state def EngineStates;  // Defined but used inconsistently
        }
        package RequirementDefinitions {
            requirement def MassRequirement {
                attribute massRequired :> ISQ::mass;
                attribute massActual :> MassUnit::kilogram;  // ERROR: MassUnit not defined
                require constraint {
                    massActual <= massRequired
                }
            }
            requirement def SpeedRequirement {
                subject vehicle: SportsCar;  // ERROR: SportsCar not defined (should be Vehicle)
            }
        }
    }
    
    package VehicleConfiguration {
        part vehicle_a: Vehicle {
            part engine: TurboEngine;  // ERROR: TurboEngine not defined (should be Engine)
            part transmission: AutomaticTransmission;  // ERROR: AutomaticTransmission not defined
            part fuelTank: FuelTank;
            
            connect engine::drivePwrPort to transmission::inputPort;  // ERROR: inputPort not defined
        }
    }
}
