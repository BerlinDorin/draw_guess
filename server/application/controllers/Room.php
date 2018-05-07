<?php
defined('BASEPATH') OR exit('No direct script access allowed');

use QCloud_WeApp_SDK\Auth\LoginService as LoginService;
use QCloud_WeApp_SDK\Constants as Constants;

require APPPATH.'business/RoomHandler.php';

class Room extends CI_Controller {
    public function index() {
        $result = LoginService::check();
        if ($result['loginState'] === Constants::S_AUTH) {
          if(RoomHandler::shouldReset()){
            RoomHandler::reset();
          }
            $this->json([
                'code' => 0,
                'roomId' => RoomHandler::getNewRoomId(),
                'roomCount' => RoomHandler::getRoomCount()
            ]);
        } else {
            $this->json([
                'code' => -1,
                'error' => $result['error']
            ]);
        }
    }
}