# To Do Items
**Possibly merge the 'proofs' in with the 'projects'? Not sure if it makes sense to do so yet...

- Create a new proof 'ExtrusionLine-Studio_Modbus'
    - Text:
        Automatically establishes connection through ModBus connection via a stand-alone SubVI. The only requirement is that the Extrusion Line must be powered on.
- Create a new proof 'ExtrusionLine-Studio_SimpleStart`
    - Text:
        The technician's procedure to start everything is to simply click the power button of the host computer on. From there, Windows boots up and the programs automatically launch, find their position on screen, and start data collection.




Alter Line 136 - To link to the network project + VLANs/Wifi routing



# ------------------------------------------------------

# AI script for generating the resume PDF file
### JSON files to include in data collection
  {
    header.json
    summary.json
    education.json
    experience.json
    skills.json
  }


## experience.json
  #### ---------------------------
  ### Items to include:
    {
      company,
      role,
      location
      start,
      end,
      context,
      bullets[text,projectID],
    }
  ### Items not to include:
    {
      bullets[proofID],
    }
  #### ---------------------------

## example.json
  #### ---------------------------
  ### Items to include:
    {

    }
  ### Items not to include:
    {

    }
  #### ---------------------------
  
  ## example.json
  #### ---------------------------
  ### Items to include:
    {
      
    }
  ### Items not to include:
    {

    }
  #### ---------------------------

## example.json
  #### ---------------------------
  ### Items to include:
    {
      
    }
  ### Items not to include:
    {

    }
  #### ---------------------------



# ------------------------------------------------------
