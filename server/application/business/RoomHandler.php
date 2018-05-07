  <?php
defined('BASEPATH') OR exit('No direct script access allowed');

class RoomHandler {
  private static $unusedRoomIds = NULL;
  private static $roomCount = 0;

  public static function getNewRoomId(){
    if(self::$unusedRoomIds->count() == 0){
      for($i = 0; $i < 10; $i++){
        self::$unusedRoomIds->insert(self::$roomCount + $i);
      }
    }
    self::$roomCount += 1;
    return self::$unusedRoomIds->extract();
  }

  public static function recycleRoomId($roomId){
    self::$unusedRoomIds->insert($roomId);
    self::$roomCount -= 1;
  }

  public static function getRoomCount(){
    return self::$roomCount;
  }

  public static function shouldReset(){
    return self::$unusedRoomIds === NULL;
  }

  public static function reset(){
    self::$unusedRoomIds = new SplMinHeap();
    self::$roomCount = 0;
  }
}