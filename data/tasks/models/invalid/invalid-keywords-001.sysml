/**
 * Invalid Metamodel - Wrong Keywords
 * Based on: GfSE/SysML-v2-Models/models/SE_Models/Metamodel.sysml
 * ERROR TYPE: SYNTAX - Invalid/misspelled SysML v2 keywords
 */
packge Metamodel {  // ERROR: "packge" should be "package"
    
    imprt ScalarValues::String;  // ERROR: "imprt" should be "import"
    
    prt def ModelElement {  // ERROR: "prt" should be "part"
        atribute muid : String;  // ERROR: "atribute" should be "attribute"
        attribute name : String;
        attribute description : String;
    }
    
}

package BaseFormat {
    
    import ScalarValues::String;
    import ScalarValues::Real;

    partdef Format {  // ERROR: should be "part def" (two words)
        attribute id : Real;
        attribute name : String;
        attribute table : String;
    }
}

package Datatypes {
    
    import Metamodel::ModelElement;
    import BaseFormat::Format;
    
    part dfe Datatype specializes ModelElement {  // ERROR: "dfe" should be "def"
        part base_format[1] : Format;
    }
    
    part def AutoReference specliaizes Datatype {  // ERROR: "specliaizes" should be "specializes"
        attribute prefix : ScalarValues::String;
        attribute start_from : ScalarValues::Boolean;
        attribute interval : ScalarValues::Boolean;
    }
    
    part def Integer specializes Datatype {
        attribute minimum_value : ScalarValues::Real;
        attribute maximum_value : ScalarValues::Real;
        attribute has_display_separator : ScalarValues::Boolean;
        attribute has_edit_separator : ScalarValues::Boolean;
        
        asert constraint { base_format.id == 1 }  // ERROR: "asert" should be "assert"
    }
    
    part Boolean : Datatype { 
        assert constrant { base_format.id == 3 }  // ERROR: "constrant" should be "constraint"
    }
}

packege poc {  // ERROR: "packege" should be "package"
    
    part test {
        part id : Datatypes::AutoReference;
        part quantity : Datatypes::Integer;
    }
}
