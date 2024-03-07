/*
* <license header>
*/

/**
 * This is a sample action showcasing how to access an external API
 *
 * Note:
 * You might want to disable authentication and authorization checks against Adobe Identity Management System for a generic action. In that case:
 *   - Remove the require-adobe-auth annotation for this action in the manifest.yml of your application
 *   - Remove the Authorization header from the array passed in checkMissingRequestInputs
 *   - The two steps above imply that every client knowing the URL to this deployed action will be able to invoke it without any authentication and authorization checks against Adobe Identity Management System
 *   - Make sure to validate these changes against your security requirements before deploying the action
 */


const fetch = require('node-fetch')
const { Core } = require('@adobe/aio-sdk')
const { errorResponse, getBearerToken, stringParameters, checkMissingRequestInputs } = require('../utils')

// main function that will be executed by Adobe I/O Runtime
async function main (params) {
  // create a Logger
  const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' })

  try {
    // 'info' is the default level if not set
    logger.info('Calling the main action')

    // log parameters, only if params.LOG_LEVEL === 'debug'
    logger.debug(stringParameters(params))

    // fetch content from external api endpoint
    const pimResponse = await fetch("https://pimcore-cert.i95-dev.com/pimcore-datahub-webservics/getProductList", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer LkLrdbeKOiOhDz047rEP5tAeXNdv8BiKV8B3Eh5u96aec431esdfhgl'
      }
    })

    if (!pimResponse.ok) {
      throw new Error('request  failed with status code ' + pimResponse.status)
    }
    const content = await pimResponse.json()

    // Create an empty array.
    let productInput = []
    let inputSku = ''
    let outputContent = []
    for (const item of content) {
      // Add each element of the JavaScript object to the array.
      inputSku = item.sku
      productInput = {
        "product" : {
            "price": item.price,
        }
      }

      const updateRes = await fetch("https://demo-riwmazy-xsofsb5roll3s.us-4.magentosite.cloud/index.php/rest/default/V1/products/"+inputSku, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 32neqr68beagmbqfyr1tb0e0mdc6hfzw'
        },
        body: JSON.stringify(productInput)
      })

      if (!updateRes.ok) {
        throw new Error('request  failed with status code ' + updateRes.status)
      }
       //outputContent = await updateRes.json()
    }

   // const outputContent = await updateRes.json()
    const response = {
      statusCode: 200,
      body: 'Successfully updated the product price at magento store'
    }

    // log the response status code
    logger.info(`${response.statusCode}: successful request`)
    return response
  } catch (error) {
    // log any server errors
    logger.error(error)
    // return with 500
    return errorResponse(500, 'server error', logger)
  }
}

exports.main = main
